import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonRefresher, IonRefresherContent,
  LoadingController, ToastController, NavController, AlertController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { Evento } from './evento.model';
import { Usuario } from '../models/usuario';

@Component({
  standalone: true,
  host: { class: 'ion-page' },
  selector: 'app-evento',
  templateUrl: './evento.page.html',
  styleUrls: ['./evento.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonContent, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonRefresher, IonRefresherContent
  ],
  providers: [Storage]
})
export class EventoPage implements OnInit {

  public lista_eventos: Evento[] = [];
  public carregando = false;
  public expandido: Set<number> = new Set();
  public usuario: Usuario | null = null;

  constructor(
    private router: Router,
    public storage: Storage,
    public controle_carregamento: LoadingController,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public controle_alerta: AlertController
  ) {}

  async ngOnInit() {
    await this.storage.create();
    await this.carregarEventos();
  }

  async ionViewWillEnter() {
    const registro = await this.storage.get('usuario');
    this.usuario = registro ? Object.assign(new Usuario(), registro) : null;
    await this.carregarEventos();
  }

  toggleDetalhes(id: number) {
    this.expandido.has(id) ? this.expandido.delete(id) : this.expandido.add(id);
  }

  async carregarEventos(event?: any) {
    this.carregando = true;

    const loading = await this.controle_carregamento.create({
      message: 'Carregando eventos...',
      duration: 30000
    });

    if (!event) await loading.present();

    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: 'http://127.0.0.1:8000/eventos/api/'
    };

    CapacitorHttp.get(options)
      .then(async (resposta: HttpResponse) => {
        loading.dismiss();
        this.carregando = false;
        if (event) event.target.complete();

        if (resposta.status === 200) {
          this.lista_eventos = resposta.data;
        } else {
          this.apresenta_mensagem(`Erro ao carregar eventos: ${resposta.status}`);
        }
      })
      .catch(async (erro: any) => {
        loading.dismiss();
        this.carregando = false;
        if (event) event.target.complete();
        this.apresenta_mensagem(`Erro de conexão: ${erro?.message ?? erro?.status}`);
      });
  }

  editarEvento(evento: Evento) {
    this.router.navigate(['/editar-evento'], { state: { evento } });
  }

  async confirmarExclusao(evento: Evento) {
    const alerta = await this.controle_alerta.create({
      header: 'Excluir Evento',
      message: `Deseja excluir "${evento.nome}"?`,
      cssClass: 'dvk-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Excluir', role: 'destructive', handler: () => this.excluirEvento(evento) }
      ]
    });
    await alerta.present();
  }

  async excluirEvento(evento: Evento) {
    const loading = await this.controle_carregamento.create({ message: 'Excluindo...', duration: 15000 });
    await loading.present();

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario?.token}`
      },
      url: `http://127.0.0.1:8000/eventos/api/${evento.id}/`
    };

    CapacitorHttp.delete(options)
      .then(async (resposta: HttpResponse) => {
        loading.dismiss();
        if (resposta.status === 204) {
          this.apresenta_mensagem('Evento excluído.');
          await this.carregarEventos();
        } else {
          this.apresenta_mensagem(`Falha ao excluir: código ${resposta.status}`);
        }
      })
      .catch(async (erro: any) => {
        loading.dismiss();
        this.apresenta_mensagem(`Erro: ${erro?.message ?? erro?.status}`);
      });
  }

  async logout() {
    await this.storage.remove('usuario');
    this.usuario = null;
    this.apresenta_mensagem('Sessão encerrada.');
  }

  formatarData(data: string): string {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  formatarHora(hora: string): string {
    return hora ? hora.slice(0, 5) : '';
  }

  async apresenta_mensagem(texto: string) {
    const toast = await this.controle_toast.create({
      message: texto,
      cssClass: 'ion-text-center',
      duration: 2000
    });
    toast.present();
  }
}

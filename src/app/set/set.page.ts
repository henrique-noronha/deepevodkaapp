import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonRefresher, IonRefresherContent, IonButton,
  LoadingController, ToastController, NavController, AlertController
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { SetMusical } from './set.model';
import { Usuario } from '../models/usuario';

@Component({
  selector: 'app-set',
  templateUrl: './set.page.html',
  styleUrls: ['./set.page.scss'],
  standalone: true,
  host: { class: 'ion-page' },
  imports: [
    CommonModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonRefresher, IonRefresherContent, IonButton
  ],
  providers: [Storage]
})
export class SetPage implements OnInit {

  public lista_sets: SetMusical[] = [];
  public carregando = false;
  public usuario: Usuario | null = null;

  constructor(
    public storage: Storage,
    public controle_carregamento: LoadingController,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public controle_alerta: AlertController
  ) {}

  async ngOnInit() {
    await this.storage.create();
    await this.carregarSets();
  }

  async ionViewWillEnter() {
    const registro = await this.storage.get('usuario');
    this.usuario = registro ? Object.assign(new Usuario(), registro) : null;
    await this.carregarSets();
  }

  async carregarSets(event?: any) {
    this.carregando = true;

    const loading = await this.controle_carregamento.create({
      message: 'Carregando sets...',
      duration: 30000
    });
    if (!event) await loading.present();

    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: 'http://127.0.0.1:8000/eventos/sets/api/'
    };

    CapacitorHttp.get(options)
      .then(async (resposta: HttpResponse) => {
        loading.dismiss();
        this.carregando = false;
        if (event) event.target.complete();

        if (resposta.status === 200) {
          const sets: SetMusical[] = resposta.data;
          this.lista_sets = sets.map(s => ({ ...s, thumbnailUrl: '' }));
          this.carregarThumbnails();
        } else {
          this.apresentaMensagem(`Erro ${resposta.status}`);
        }
      })
      .catch(async (erro: any) => {
        loading.dismiss();
        this.carregando = false;
        if (event) event.target.complete();
        this.apresentaMensagem(`Erro de conexão: ${erro?.message ?? erro?.status}`);
      });
  }

  private carregarThumbnails() {
    this.lista_sets.forEach((set, index) => {
      if (set.tipo === 'youtube') {
        this.lista_sets[index].thumbnailUrl = this.getYoutubeThumbnail(set.url);
      } else if (set.tipo === 'soundcloud') {
        this.getSoundcloudThumbnail(set.url).then(url => {
          this.lista_sets[index].thumbnailUrl = url;
        });
      }
    });
  }

  async confirmarExclusao(set: SetMusical) {
    const alerta = await this.controle_alerta.create({
      header: 'Excluir Set',
      message: `Deseja excluir "${set.nome}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Excluir', role: 'destructive', handler: () => this.excluirSet(set) }
      ]
    });
    await alerta.present();
  }

  async excluirSet(set: SetMusical) {
    const loading = await this.controle_carregamento.create({ message: 'Excluindo...', duration: 15000 });
    await loading.present();

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario?.token}`
      },
      url: `http://127.0.0.1:8000/eventos/sets/api/${set.id}/`
    };

    CapacitorHttp.delete(options)
      .then(async (resposta: HttpResponse) => {
        loading.dismiss();
        if (resposta.status === 204) {
          this.apresentaMensagem('Set excluído.');
          await this.carregarSets();
        } else {
          this.apresentaMensagem(`Falha ao excluir: código ${resposta.status}`);
        }
      })
      .catch(async (erro: any) => {
        loading.dismiss();
        this.apresentaMensagem(`Erro: ${erro?.message ?? erro?.status}`);
      });
  }

  getYoutubeThumbnail(url: string): string {
    const patterns = [
      /youtube\.com\/watch\?v=([^&?/]+)/,
      /youtu\.be\/([^&?/]+)/,
      /youtube\.com\/embed\/([^&?/]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return '';
  }

  async getSoundcloudThumbnail(url: string): Promise<string> {
    try {
      const options: HttpOptions = {
        headers: {},
        url: `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`
      };
      const resposta = await CapacitorHttp.get(options);
      return resposta.data?.thumbnail_url ?? '';
    } catch {
      return '';
    }
  }

  abrirLink(url: string) {
    window.open(url, '_blank');
  }

  formatarData(data: string | null): string {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  async logout() {
    await this.storage.remove('usuario');
    this.usuario = null;
    this.apresentaMensagem('Sessão encerrada.');
  }

  async apresentaMensagem(texto: string) {
    const toast = await this.controle_toast.create({
      message: texto,
      cssClass: 'ion-text-center',
      duration: 2500
    });
    toast.present();
  }
}

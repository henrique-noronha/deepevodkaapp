import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonInput, IonTextarea, IonButton,
  LoadingController, NavController, ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { Evento } from '../evento/evento.model';
import { Usuario } from '../models/usuario';

@Component({
  standalone: true,
  host: { class: 'ion-page' },
  selector: 'app-editar-evento',
  templateUrl: './editar-evento.page.html',
  styleUrls: ['./editar-evento.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonTextarea, IonButton
  ],
  providers: [Storage]
})
export class EditarEventoPage implements OnInit {

  public usuario: Usuario = new Usuario();
  public evento: Evento = new Evento();

  constructor(
    private router: Router,
    public storage: Storage,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public controle_carregamento: LoadingController
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;
    if (state && state['evento']) {
      this.evento = Object.assign(new Evento(), state['evento']);
    }
  }

  async ngOnInit() {
    await this.storage.create();
    const registro = await this.storage.get('usuario');

    if (registro) {
      this.usuario = Object.assign(new Usuario(), registro);
    } else {
      this.controle_navegacao.navigateRoot('/home');
      return;
    }

    if (this.evento.id === 0) {
      this.apresenta_mensagem('Evento não encontrado.');
      this.controle_navegacao.navigateBack('/evento');
    }
  }

  async salvarEvento() {
    const loading = await this.controle_carregamento.create({ message: 'Salvando...', duration: 30000 });
    await loading.present();

    const body = {
      nome: this.evento.nome,
      data: this.evento.data,
      hora: this.evento.hora,
      local: this.evento.local,
      descricao: this.evento.descricao,
      capacidade: this.evento.capacidade,
      link_ingresso: this.evento.link_ingresso
    };

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: `http://127.0.0.1:8000/eventos/api/${this.evento.id}/`,
      data: body
    };

    CapacitorHttp.patch(options)
      .then(async (resposta: HttpResponse) => {
        loading.dismiss();
        if (resposta.status === 200) {
          await this.apresenta_mensagem('Evento atualizado com sucesso!');
          this.controle_navegacao.navigateBack('/evento');
        } else {
          this.apresenta_mensagem(`Falha ao atualizar: código ${resposta.status}`);
        }
      })
      .catch(async (erro: any) => {
        loading.dismiss();
        this.apresenta_mensagem(`Falha ao atualizar: ${erro?.message ?? erro?.status}`);
      });
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

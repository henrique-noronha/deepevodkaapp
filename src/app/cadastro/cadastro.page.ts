import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { Usuario } from '../models/usuario';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonItem, IonInput, IonList, IonButtons, IonBackButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  host: { class: 'ion-page' },
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonItem, IonInput, IonList, IonButtons, IonBackButton
  ],
  providers: [Storage, LoadingController, NavController, ToastController]
})
export class CadastroPage {

  public instancia = { username: '', password: '', confirmar: '', email: '' };

  constructor(
    public controle_carregamento: LoadingController,
    public controle_navegacao: NavController,
    public controle_toast: ToastController,
    public storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();
  }

  async cadastrar() {
    const { username, password, confirmar, email } = this.instancia;

    if (!username || !password) {
      return this.apresenta_mensagem('Preencha usuário e senha.');
    }
    if (password.length < 8) {
      return this.apresenta_mensagem('A senha deve ter pelo menos 8 caracteres.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\/\\[\]~]/.test(password)) {
      return this.apresenta_mensagem('A senha deve conter pelo menos um caractere especial (!@#$%^&* etc).');
    }
    if (password !== confirmar) {
      return this.apresenta_mensagem('As senhas não coincidem.');
    }

    const loading = await this.controle_carregamento.create({ message: 'Criando conta...', duration: 15000 });
    await loading.present();

    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: 'http://127.0.0.1:8000/cadastro-api/',
      data: { username, password, email }
    };

    CapacitorHttp.post(options)
      .then(async (resposta: HttpResponse) => {
        loading.dismiss();
        if (resposta.status === 201) {
          const usuario: Usuario = Object.assign(new Usuario(), resposta.data);
          await this.storage.set('usuario', usuario);
          await this.apresenta_mensagem('Conta criada com sucesso!');
          this.controle_navegacao.navigateRoot('/evento');
        } else {
          const erro = resposta.data?.erro ?? `Erro ${resposta.status}`;
          this.apresenta_mensagem(erro);
        }
      })
      .catch(async (erro: any) => {
        loading.dismiss();
        this.apresenta_mensagem(`Erro de conexão: ${erro?.message ?? erro?.status}`);
      });
  }

  async apresenta_mensagem(texto: string) {
    const toast = await this.controle_toast.create({
      message: texto,
      cssClass: 'ion-text-center',
      duration: 2500
    });
    toast.present();
  }
}

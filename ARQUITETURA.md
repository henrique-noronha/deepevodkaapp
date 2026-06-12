# Deep&Vodka — App Mobile

Aplicativo mobile da plataforma Deep&Vodka, desenvolvido em **Ionic + Angular**. Consome a API REST do servidor Django, permite visualização de eventos e sets musicais, e oferece funcionalidades administrativas para usuários staff.

---

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| Ionic | 7 | Framework de UI mobile |
| Angular | 17 | Framework SPA (componentes, roteamento) |
| TypeScript | 5 | Linguagem base |
| Capacitor | 5 | Bridge nativo (HTTP, Storage) |
| @ionic/storage-angular | — | Persistência local (token, dados do usuário) |

---

## Arquitetura

O app usa **componentes standalone** do Angular — cada página é um componente autossuficiente com seus próprios imports, sem NgModule global.

```
Usuário interage
      ↓
  Componente (.page.ts)     ← lógica, estado, chamadas API
      ↓
  Template (.page.html)     ← interface, bindings, eventos
      ↓
  Estilos (.page.scss)      ← estilos escopados por componente
```

O roteamento é **lazy loading** — cada página só é carregada quando o usuário navega até ela.

---

## Estrutura de arquivos

```
src/
├── app/
│   ├── app.routes.ts           # mapa de rotas da aplicação
│   ├── app.component.ts/html   # shell principal (ion-router-outlet)
│   ├── models/
│   │   └── usuario.ts          # modelo do usuário autenticado
│   ├── evento/                 # listagem de eventos
│   │   ├── evento.page.ts
│   │   ├── evento.page.html
│   │   ├── evento.page.scss
│   │   └── evento.model.ts
│   ├── editar-evento/          # edição de evento (admin)
│   ├── set/                    # listagem de sets musicais
│   │   ├── set.page.ts
│   │   ├── set.page.html
│   │   ├── set.page.scss
│   │   └── set.model.ts
│   ├── sobre/                  # página Sobre Nós + redes sociais
│   ├── home/                   # página de login
│   └── cadastro/               # página de cadastro
├── assets/
│   └── logo-deepvodka.png
└── global.scss                 # estilos globais e overrides Ionic
```

---

## Rotas

| Path | Componente | Acesso |
|---|---|---|
| `/` | → redireciona para `/evento` | — |
| `/evento` | `EventoPage` | Público |
| `/set` | `SetPage` | Público |
| `/sobre` | `SobrePage` | Público |
| `/home` | `HomePage` (login) | Público |
| `/cadastro` | `CadastroPage` | Público |
| `/editar-evento` | `EditarEventoPage` | Admin |

---

## Como o app consome a API

O app usa **`CapacitorHttp`** em vez do `HttpClient` padrão do Angular. Em dispositivos nativos, requisições feitas dentro da WebView são bloqueadas pelo CORS. O `CapacitorHttp` executa a requisição fora da WebView, no lado nativo, contornando essa restrição.

### Padrão de chamada

```typescript
const options: HttpOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Token ${this.usuario.token}`  // quando autenticado
  },
  url: 'http://127.0.0.1:8000/eventos/api/'
};

CapacitorHttp.get(options)
  .then((resposta: HttpResponse) => {
    if (resposta.status === 200) {
      this.lista = resposta.data;
    }
  })
  .catch((erro) => { /* trata erro de conexão */ });
```

### Endpoints consumidos

| Página | Método | Endpoint | Auth |
|---|---|---|---|
| `HomePage` | POST | `/autenticacao-api/` | Não |
| `CadastroPage` | POST | `/cadastro-api/` | Não |
| `EventoPage` | GET | `/eventos/api/` | Não |
| `EventoPage` | DELETE | `/eventos/api/<id>/` | Token |
| `EditarEventoPage` | PATCH | `/eventos/api/<id>/` | Token |
| `SetPage` | GET | `/eventos/sets/api/` | Não |
| `SetPage` | DELETE | `/eventos/sets/api/<id>/` | Token |

---

## Autenticação e Sessão

### Login

```
POST /autenticacao-api/  {username, password}
← {id, token, is_staff, nome, email}
```

O objeto retornado é salvo no `@ionic/storage-angular` com a chave `'usuario'`. Ele persiste entre sessões — o usuário continua logado após fechar o app.

### Modelo de usuário (`models/usuario.ts`)

```typescript
export class Usuario {
  id: number = 0;
  username: string = '';
  token: string = '';
  is_staff: boolean = false;
  nome: string = '';
  email: string = '';
}
```

### Controle de acesso nas páginas

Cada página verifica o storage em `ionViewWillEnter`:

```typescript
async ionViewWillEnter() {
  const registro = await this.storage.get('usuario');
  this.usuario = registro ? Object.assign(new Usuario(), registro) : null;
}
```

O `is_staff` é usado nos templates para mostrar ou ocultar ações administrativas:

```html
<!-- botões de editar/excluir só aparecem para admin -->
<div *ngIf="usuario?.is_staff" class="dvk-admin-actions">
  <ion-button (click)="editarEvento(evento)">Editar</ion-button>
  <ion-button (click)="confirmarExclusao(evento)">Excluir</ion-button>
</div>
```

---

## Thumbnails de Sets

A página de Sets carrega miniaturas dinamicamente, sem chave de API.

### YouTube
Extrai o ID do vídeo via regex e monta a URL do CDN público:
```typescript
const match = url.match(/youtube\.com\/watch\?v=([^&?/]+)/);
return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
```

### SoundCloud
Usa o endpoint público oEmbed:
```typescript
CapacitorHttp.get({
  url: `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`
});
// resposta: { thumbnail_url: "https://..." }
```

---

## Header fixo (padrão DVK)

O Ionic padrão (`ion-header`) apresentava problema de scroll no layout deste projeto. A solução adotada foi substituir por um `<div>` customizado com `position: fixed`:

```html
<div class="dvk-header">
  <span class="dvk-header-brand">DEEP<span class="dvk-red">&amp;</span>VODKA</span>
  <div class="dvk-header-actions">
    <button (click)="controle_navegacao.navigateForward('/set')">Sets</button>
    ...
  </div>
</div>

<ion-content>  <!-- --padding-top: 56px compensa o header fixo -->
```

Todas as páginas seguem este padrão.

---

## Como rodar

```bash
cd sistema-mobile
npm install
ionic serve          # browser (desenvolvimento)
ionic cap run android  # dispositivo Android
```

O servidor Django deve estar rodando em `http://127.0.0.1:8000` para o app funcionar.

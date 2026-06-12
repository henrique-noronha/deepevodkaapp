# Deep&Vodka — App Mobile

Aplicativo mobile da plataforma **Deep&Vodka**, desenvolvido com Ionic + Angular + Capacitor. Consome a API REST do [servidor Django](https://github.com/henrique-noronha/deepevodkaapp) para exibir eventos e sets musicais, e oferece painel administrativo para usuários staff.

---

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| [Ionic](https://ionicframework.com/) | 8 | Framework de UI mobile |
| [Angular](https://angular.dev/) | 20 | Framework SPA (componentes standalone, roteamento) |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Linguagem base |
| [Capacitor](https://capacitorjs.com/) | 8 | Bridge nativo (HTTP, Storage, Haptics) |
| [@ionic/storage-angular](https://github.com/ionic-team/ionic-storage) | 4 | Persistência local (token, sessão do usuário) |

---

## Funcionalidades

- Listagem de **eventos** com suporte a exclusão e edição (admin)
- Listagem de **sets musicais** com thumbnails automáticos (YouTube e SoundCloud)
- **Autenticação** via token — sessão persiste entre sessões do app
- **Controle de acesso** por perfil: ações administrativas visíveis apenas para `is_staff`
- **Cadastro** de novos usuários

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── app.routes.ts               # Mapa de rotas (lazy loading)
│   ├── app.component.ts/html       # Shell principal (ion-router-outlet)
│   ├── models/
│   │   └── usuario.ts              # Modelo do usuário autenticado
│   ├── home/                       # Tela de login
│   ├── cadastro/                   # Tela de cadastro
│   ├── evento/                     # Listagem e gerenciamento de eventos
│   ├── editar-evento/              # Edição de evento (admin)
│   ├── set/                        # Listagem de sets musicais
│   └── sobre/                      # Sobre o projeto + redes sociais
├── assets/
│   └── logo-deepvodka.png
└── global.scss                     # Estilos globais e overrides Ionic
```

---

## Rotas

| Path | Página | Acesso |
|---|---|---|
| `/` | → redireciona para `/evento` | — |
| `/evento` | Listagem de eventos | Público |
| `/set` | Listagem de sets musicais | Público |
| `/sobre` | Sobre nós + redes sociais | Público |
| `/home` | Login | Público |
| `/cadastro` | Cadastro | Público |
| `/editar-evento` | Edição de evento | Admin |

---

## Comunicação com a API

O app usa **`CapacitorHttp`** em vez do `HttpClient` padrão do Angular. Em dispositivos nativos, requisições feitas dentro da WebView são bloqueadas pelo CORS. O `CapacitorHttp` executa a requisição no lado nativo, contornando essa restrição.

### Endpoints

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

O login retorna `{ id, token, is_staff, nome, email }`, que é salvo no `@ionic/storage-angular` com a chave `'usuario'`. A sessão persiste entre reabertas do app.

Cada página verifica o storage em `ionViewWillEnter` e usa `is_staff` para exibir ou ocultar ações administrativas nos templates.

---

## Como Rodar

### Pré-requisitos

- Node.js 18+
- Ionic CLI: `npm install -g @ionic/cli`
- Backend Django rodando em `http://127.0.0.1:8000`

### Instalação

```bash
git clone https://github.com/henrique-noronha/deepevodkaapp.git
cd sistema-mobile
npm install
```

### Desenvolvimento (browser)

```bash
ionic serve
```

### Android (dispositivo ou emulador)

```bash
ionic build
ionic cap sync android
ionic cap run android
```

---

## Projeto Web

O sistema web (Django + backend da API) está em repositório separado:
[github.com/henrique-noronha/deepevodkaapp](https://github.com/henrique-noronha/deepevodka)

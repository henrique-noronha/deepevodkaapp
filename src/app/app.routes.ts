import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'evento',
    pathMatch: 'full',
  },
  {
    path: 'evento',
    loadComponent: () => import('./evento/evento.page').then(m => m.EventoPage)
  },
  {
    path: 'editar-evento',
    loadComponent: () => import('./editar-evento/editar-evento.page').then(m => m.EditarEventoPage)
  },
  {
    path: 'set',
    loadComponent: () => import('./set/set.page').then(m => m.SetPage)
  },
  {
    path: 'sobre',
    loadComponent: () => import('./sobre/sobre.page').then(m => m.SobrePage)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./cadastro/cadastro.page').then(m => m.CadastroPage)
  },
];

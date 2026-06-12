export class SetMusical {
    public id: number;
    public nome: string;
    public url: string;
    public tipo: 'youtube' | 'soundcloud';
    public descricao: string;
    public data: string | null;
    public thumbnailUrl: string;

    constructor() {
        this.id = 0;
        this.nome = '';
        this.url = '';
        this.tipo = 'youtube';
        this.descricao = '';
        this.data = null;
        this.thumbnailUrl = '';
    }
}

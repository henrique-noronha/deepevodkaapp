export class Evento {
    public id: number;
    public nome: string;
    public data: string;
    public hora: string;
    public local: string;
    public banner: string | null;
    public descricao: string;
    public capacidade: number | null;
    public link_ingresso: string | null;

    constructor() {
        this.id = 0;
        this.nome = '';
        this.data = '';
        this.hora = '';
        this.local = '';
        this.banner = null;
        this.descricao = '';
        this.capacidade = null;
        this.link_ingresso = null;
    }
}

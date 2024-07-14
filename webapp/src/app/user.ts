export class User {
  constructor(
    public id: string  = null,
    public username?: string,
    public firstname?: string,
    public lastname?: string,
    public email?: string,
    public userStatus?: string,
    public department?: string,
  ) {}
}

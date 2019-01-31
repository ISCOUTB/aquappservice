import {inject} from '@loopback/context';
import {get, post, del, put, requestBody, param} from '@loopback/openapi-v3';
import {UserRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {User} from '../models';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';

export class UserController {
  constructor(
    @repository(UserRepository) public usersRepo: UserRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: number},
  ) {}

  @authenticate('BasicStrategy')
  @post('/users/login')
  async login() {
    return {token: this.user.token};
  }

  @authenticate('BearerStrategy', {type: -1})
  @post('/users/new-admin')
  async newAdmin(@requestBody() user: User) {
    return await this.usersRepo
      .create(new User(user))
      .then(() => Promise.resolve({}), () => Promise.reject({}));
  }

  @authenticate('BearerStrategy', {type: -2})
  @get('/users/get')
  async getUsers(
    @param.query.number('pageIndex') pageIndex: number,
    @param.query.number('pageSize') pageSize: number,
  ) {
    let users: User[] = await this.usersRepo.find().then(u => u, () => []);

    return {
      items: users.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize > users.length - 1
          ? undefined
          : (pageIndex + 1) * pageSize,
      ),
      total: users.length,
    };
  }

  @authenticate('BearerStrategy', {type: -2})
  @del('/users/del')
  async delUser(@param.query.string('id') id: string) {
    return await this.usersRepo
      .deleteById(id)
      .then(() => Promise.resolve({}), () => Promise.reject({}));
  }

  @authenticate('BearerStrategy', {type: -2})
  @put('/users/edit')
  async editUser(@requestBody() body: User) {
    return await this.usersRepo.findById(body.id).then(
      user => {
        user.name = body.name ? body.name : user.name;
        user.email = body.email ? body.email : user.email;
        user.password = body.password ? body.password : user.password;
        user.enabled = body.enabled;
        this.usersRepo.save(user);
        Promise.resolve({});
      },
      () => Promise.reject({}),
    );
  }
}

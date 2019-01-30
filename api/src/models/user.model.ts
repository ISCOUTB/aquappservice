import {Entity, model, property} from '@loopback/repository';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'number',
    required: true,
    default: 0,
  })
  userType: number;

  @property({
    type: 'boolean',
    required: true,
    default: true
  })
  enabled: boolean;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

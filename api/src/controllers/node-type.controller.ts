import {inject} from '@loopback/context';
import {get, post, del, put, requestBody, param} from '@loopback/openapi-v3';
import {NodeTypeRepository, NodeRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {NodeType} from '../models';

export class NodeTypeController {
  constructor(
    @repository(NodeTypeRepository)
    public nodeTypeRepository: NodeTypeRepository,
    @repository(NodeRepository) public nodeRepository: NodeRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: number},
  ) {}

  @get('/node-types')
  async getUsers(
    @param.query.number('pageIndex') pageIndex: number,
    @param.query.number('pageSize') pageSize: number,
  ) {
    let nodeTypes: NodeType[] = await this.nodeTypeRepository
      .find()
      .then(u => u, () => []);

    if ((pageIndex === pageSize) === undefined) {
      return nodeTypes;
    }

    return {
      items: nodeTypes.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize > nodeTypes.length - 1
          ? undefined
          : (pageIndex + 1) * pageSize,
      ),
      total: nodeTypes.length,
    };
  }

  @authenticate('BearerStrategy', {type: -1})
  @post('/node-types')
  async newAdmin(@requestBody() body: NodeType) {
    body.userId = this.user.id;
    return await this.nodeTypeRepository
      .create(new NodeType(body))
      .then(() => Promise.resolve({}), () => Promise.reject({}));
  }

  @authenticate('BearerStrategy', {type: -1})
  @del('/node-types')
  async delUser(@param.query.string('id') id: string) {
    return await this.nodeTypeRepository
      .findById(id)
      .then(async (nodeType: NodeType) => {
        let isBeingUsed = false;
        await this.nodeRepository.find().then(nodes => {
          for (const node of nodes) {
            if (node.nodeTypeId === id) {
              isBeingUsed = true;
              break;
            }
          }
        });
        if (isBeingUsed) {
          return Promise.reject({status: 400});
        }

        return await this.nodeTypeRepository
          .deleteById(id)
          .then(() => Promise.resolve({}), () => Promise.reject({}));
      });
  }

  @authenticate('BearerStrategy', {type: -1})
  @put('/node-types')
  async editOne(
    @requestBody()
    body: NodeType,
  ) {
    return await this.nodeTypeRepository.findById(body.id).then(
      nodeType => {
        nodeType.name = body.name ? body.name : nodeType.name;
        nodeType.separator = body.separator
          ? body.separator
          : nodeType.separator;
        this.nodeTypeRepository.save(nodeType);
        return Promise.resolve({});
      },
      () => Promise.reject({}),
    );
  }
}

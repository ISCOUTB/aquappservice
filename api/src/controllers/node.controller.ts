import {inject} from '@loopback/context';
import {get, post, del, put, requestBody, param} from '@loopback/openapi-v3';
import {NodeRepository, WaterBodyRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {Node} from '../models';

export class NodeController {
  constructor(
    @repository(NodeRepository)
    public nodeRepository: NodeRepository,
    @repository(WaterBodyRepository)
    public waterBodyRepository: WaterBodyRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: number},
  ) {}

  @get('/nodes')
  async getElements(
    @param.query.number('pageIndex') pageIndex: number,
    @param.query.number('pageSize') pageSize: number,
  ) {
    let nodes: Node[] = await this.nodeRepository.find().then(n => n, () => []);

    if ((pageIndex === pageSize) === undefined) {
      return nodes;
    }

    return {
      items: nodes.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize > nodes.length - 1
          ? undefined
          : (pageIndex + 1) * pageSize,
      ),
      total: nodes.length,
    };
  }

  @authenticate('BearerStrategy', {type: -1})
  @post('/nodes')
  async newElement(@requestBody() body: Node) {
    body.userId = this.user.id;
    return await this.nodeRepository
      .create(new Node(body))
      .then(() => Promise.resolve({}), () => Promise.reject({}));
  }

  @authenticate('BearerStrategy', {type: -1})
  @del('/nodes')
  async delElement(@param.query.string('id') id: string) {
    return await this.nodeRepository.findById(id).then(async (node: Node) => {
      let isBeingUsed = false;
      await this.waterBodyRepository.find().then(waterBodies => {
        for (const waterBody of waterBodies) {
          if (node.waterBodyId === waterBody.id) {
            isBeingUsed = true;
            break;
          }
        }
      });
      if (isBeingUsed) {
        return Promise.reject({status: 400});
      }

      return await this.nodeRepository
        .deleteById(id)
        .then(() => Promise.resolve({}), () => Promise.reject({}));
    });
  }

  @authenticate('BearerStrategy', {type: -1})
  @put('/nodes')
  async editElement(
    @requestBody()
    body: Node,
  ) {
    return await this.nodeRepository.findById(body.id).then(
      node => {
        node.name = body.name ? body.name : node.name;
        node.location = body.location ? body.location : node.location;
        node.coordinates = body.coordinates
          ? body.coordinates
          : node.coordinates;
        node.status = body.status ? body.status : node.status;
        this.nodeRepository.save(node);
        return Promise.resolve({});
      },
      () => Promise.reject({}),
    );
  }
}

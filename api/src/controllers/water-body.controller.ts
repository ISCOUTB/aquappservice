import {inject} from '@loopback/context';
import {get, post, del, put, requestBody, param} from '@loopback/openapi-v3';
import {NodeRepository, WaterBodyRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {WaterBody} from '../models';

export class WaterBodyController {
  constructor(
    @repository(WaterBodyRepository)
    private waterBodyRepository: WaterBodyRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: number},
    @repository(NodeRepository)
    public nodeRepository: NodeRepository,
  ) {}

  @get('/water-bodies')
  async getElements(
    @param.query.string('id') id: string,
    @param.query.number('pageIndex') pageIndex: number,
    @param.query.number('pageSize') pageSize: number,
  ) {
    if (id) {
      return await this.waterBodyRepository
        .findById(id)
        .then(wb => wb, () => Promise.reject({}));
    }
    let waterBodies: WaterBody[] = await this.waterBodyRepository
      .find()
      .then(n => n, () => []);

    if ((pageIndex === pageSize) === undefined) {
      return waterBodies;
    }

    return {
      items: waterBodies.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize > waterBodies.length - 1
          ? undefined
          : (pageIndex + 1) * pageSize,
      ),
      total: waterBodies.length,
    };
  }

  @authenticate('BearerStrategy', {type: -1})
  @post('/water-bodies')
  async newElement(@requestBody() body: WaterBody) {
    body.userId = this.user.id;
    return await this.waterBodyRepository
      .create(new WaterBody(body))
      .then(() => Promise.resolve({}), () => Promise.reject({}));
  }

  @authenticate('BearerStrategy', {type: -1})
  @del('/water-bodies')
  async delElement(@param.query.string('id') id: string) {
    return await this.waterBodyRepository
      .findById(id)
      .then(async (waterBody: WaterBody) => {
        // Disassociate all its nodes
        await this.nodeRepository.find().then(
          nodes => {
            for (const node of nodes) {
              if (node.waterBodyId === waterBody.id) {
                node.waterBodyId = undefined;
                this.nodeRepository.save(node);
              }
            }
          },
          () => {},
        );

        return await this.waterBodyRepository
          .deleteById(id)
          .then(() => Promise.resolve({}), () => Promise.reject({}));
      });
  }

  @authenticate('BearerStrategy', {type: -1})
  @put('/water-bodies')
  async editElement(
    @requestBody()
    body: WaterBody,
  ) {
    return await this.waterBodyRepository.findById(body.id).then(
      waterBody => {
        waterBody.name = body.name ? body.name : waterBody.name;
        waterBody.geojson = body.geojson ? body.geojson : waterBody.geojson;
        waterBody.nodes = body.nodes;
        this.waterBodyRepository.save(waterBody);
        return Promise.resolve({});
      },
      () => Promise.reject({}),
    );
  }
}

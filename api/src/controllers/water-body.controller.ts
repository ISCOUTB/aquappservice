import {inject} from '@loopback/context';
import {get, post, del, put, requestBody, param} from '@loopback/openapi-v3';
import {NodeRepository, WaterBodyRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {WaterBody} from '../models';

/**
 * Water body CRUD operations
 */
export class WaterBodyController {
  /**
   * 
   * @param waterBodyRepository Water body repository
   * @param user Information about the currently authenticated
   *  user (if any). This information is provided by the callback function
   *  in the method verifyBearer of the class AuthStrategyProvider in
   *  auth-strategy.provider.ts (the payload of the token).
   *  The second parameter makes it possible to have unprotected methods
   *  like getElemets.
   * @param nodeRepository Node repository
   */
  constructor(
    @repository(WaterBodyRepository)
    private waterBodyRepository: WaterBodyRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: string},
    @repository(NodeRepository)
    public nodeRepository: NodeRepository,
  ) {}

  /**
   * 
   * @param id Id of the water body
   * @param pageIndex Page number, 0 to N.
   * @param pageSize Number of elements
   */
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

    if (pageIndex === undefined && pageSize === undefined) {
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

  /**
   * Creates a new water body
   * @param body New water body
   */
  @authenticate('BearerStrategy', {whiteList: ['superuser']})
  @post('/water-bodies')
  async newElement(@requestBody() body: WaterBody) {
    body.userId = this.user.id;
    return await this.waterBodyRepository
      .create(new WaterBody(body))
      .then(() => Promise.resolve({}), () => Promise.reject({}));
  }

  /**
   * Deletes a water body
   * @param id Id of the water body to be deleted
   */
  @authenticate('BearerStrategy', {whiteList: ['superuser']})
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

  /**
   * Updates every field of a water body with
   * new data, except for its id.
   * @param body New water body data
   */
  @authenticate('BearerStrategy', {whiteList: ['superuser']})
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

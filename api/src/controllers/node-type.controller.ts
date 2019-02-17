import {inject} from '@loopback/context';
import {get, post, del, put, requestBody, param} from '@loopback/openapi-v3';
import {
  NodeTypeRepository,
  NodeRepository,
  SensorRepository,
} from '../repositories';
import {repository} from '@loopback/repository';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {NodeType} from '../models';

export class NodeTypeController {
  /**
   * 
   * @param nodeTypeRepository Node types repository
   * @param nodeRepository Node repository
   * @param sensorRepository Sensors repository
   * @param user Information about the currently authenticated
   *  user (if any). This information is provided by the callback function
   *  in the method verifyBearer of the class AuthStrategyProvider in
   *  auth-strategy.provider.ts (the payload of the token).
   *  The second parameter makes it possible to have unprotected methods
   *  like getElemets.
   */
  constructor(
    @repository(NodeTypeRepository)
    public nodeTypeRepository: NodeTypeRepository,
    @repository(NodeRepository) public nodeRepository: NodeRepository,
    @repository(SensorRepository) public sensorRepository: SensorRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: number},
  ) {}

  /**
   * Get a page of node types
   * @param pageIndex Page number, 0 to N
   * @param pageSize Number of elements
   */
  @get('/node-types')
  async getElements(
    @param.query.number('pageIndex') pageIndex: number,
    @param.query.number('pageSize') pageSize: number,
  ) {
    let nodeTypes: NodeType[] = await this.nodeTypeRepository
      .find()
      .then(u => u, () => []);

    if (pageIndex === undefined && pageSize === undefined) {
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

  /**
   * Creates a new node type
   * @param body New node type
   */
  @authenticate('BearerStrategy', {type: -1})
  @post('/node-types')
  async newElement(@requestBody() body: NodeType) {
    body.userId = this.user.id;
    return await this.nodeTypeRepository
      .create(new NodeType(body))
      .then(() => Promise.resolve({}), () => Promise.reject({}));
  }

  /**
   * Deletes a node type by its id
   * @param id Id of the node type to be deleted
   */
  @authenticate('BearerStrategy', {type: -1})
  @del('/node-types')
  async delElement(@param.query.string('id') id: string) {
    return await this.nodeTypeRepository
      .findById(id)
      .then(async (nodeType: NodeType) => {
        // Check if a Node is of this node type
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

        // Delete all its sensors
        await this.sensorRepository.find().then(
          sensors => {
            const sen = sensors.filter(s => s.nodeTypeId === id);
            for (const s of sen) {
              this.sensorRepository.deleteById(s.id);
            }
          },
          () => {},
        );

        return await this.nodeTypeRepository
          .deleteById(id)
          .then(() => Promise.resolve({}), () => Promise.reject({}));
      });
  }

  /**
   * Updates a node type with new data
   * @param body New node type data
   */
  @authenticate('BearerStrategy', {type: -1})
  @put('/node-types')
  async editElement(
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

import {inject} from '@loopback/context';
import {get, post, del, put, requestBody, param} from '@loopback/openapi-v3';
import {
  NodeRepository,
  WaterBodyRepository,
  SensorRepository,
  NodeDataRepository,
} from '../repositories';
import {repository} from '@loopback/repository';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {Node, NodeData, WaterBody} from '../models';

export class NodeController {
  /**
   * 
   * @param nodeRepository Node repository
   * @param waterBodyRepository Water body repository
   * @param sensorRepository Sensor repository
   * @param nodeDataRepository Node data repository
   * @param user Information about the currently authenticated
   *  user (if any). This information is provided by the callback function
   *  in the method verifyBearer of the class AuthStrategyProvider in
   *  auth-strategy.provider.ts (the payload of the token).
   *  The second parameter makes it possible to have unprotected methods
   *  like getElemets.
   */
  constructor(
    @repository(NodeRepository)
    public nodeRepository: NodeRepository,
    @repository(WaterBodyRepository)
    public waterBodyRepository: WaterBodyRepository,
    @repository(SensorRepository) public sensorRepository: SensorRepository,
    @repository(NodeDataRepository)
    public nodeDataRepository: NodeDataRepository,
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: {name: string; id: string; token: string; type: string},
  ) {}

  /**
   * Get a node page (filtered by the water body they belong to, if waterBodyId
   * is provided).
   * @param waterBodyId Id of the water body that the nodes belong to
   * @param nodeTypeId Type of the nodes
   * @param pageIndex Page number, 0 to N
   * @param pageSize Number of elements
   */
  @get('/nodes')
  async getElements(
    @param.query.string('waterBodyId') waterBodyId: string,
    @param.query.string('nodeTypeId') nodeTypeId: string,
    @param.query.number('pageIndex') pageIndex: number,
    @param.query.number('pageSize') pageSize: number,
  ) {
    let nodes: Node[] = await this.nodeRepository.find().then(n => n, () => []);

    if (nodeTypeId) {
      nodes = nodes.filter(nf => nf.nodeTypeId === nodeTypeId);
    }

    if (waterBodyId) {
      const waterBody:
        | WaterBody
        | undefined = await this.waterBodyRepository
        .findById(waterBodyId)
        .then(wb => wb, () => undefined);
      if (!waterBody) {
        return Promise.reject({});
      }
      if (waterBody.nodes) {
        nodes = nodes.filter(nf => waterBody.nodes.indexOf(nf.id!) !== -1);
      } else {
        return {
          items: [],
          total: 0
        };
      }
      nodes = nodes.filter(nf => nf.nodeTypeId === '59c9d9019a892016ca4be412');
    }

    if (pageIndex === undefined && pageSize === undefined) {
      return {
        items: nodes,
        total: nodes.length,
      };
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

  /**
   * Creates a new node, and its node data definition
   * depending on their node type id.
   * @param body New node
   */
  @authenticate('BearerStrategy', {whiteList: ['superuser']})
  @post('/nodes')
  async newElement(@requestBody() body: Node) {
    body.userId = this.user.id;
    const variables: string[] = await this.sensorRepository
      .find()
      .then(s =>
        s.filter(r => r.nodeTypeId === body.nodeTypeId).map(v => v.variable),
      );

    return await this.nodeRepository.create(new Node(body)).then(
      async node => {
        for (const variable of variables) {
          await this.nodeDataRepository
            .create(
              new NodeData({
                variable: variable,
                data: [],
                nodeId: node.id,
              }),
            )
            .then(
              nodeData =>
                console.log(
                  `Variable ${variable} definition with id ${
                    nodeData.id
                  } created`,
                ),
              e =>
                console.log(`Variable ${variable} was NOT created, err: ${e}`),
            );
        }
        return Promise.resolve({});
      },
      () => Promise.reject({}),
    );
  }

  /**
   * Deletes a node by its id
   * @param id Id of the node to be deleted
   */
  @authenticate('BearerStrategy', {whiteList: ['superuser']})
  @del('/nodes')
  async delElement(@param.query.string('id') id: string) {
    return await this.nodeRepository.findById(id).then(async (node: Node) => {
      console.log(`Deleting ${node.id}`);
      // Delete node data
      await this.nodeDataRepository.find().then(
        async nodeDataList => {
          for (const nodeData of nodeDataList) {
            if (nodeData.nodeId !== node.id) {
              continue;
            }
            await this.nodeDataRepository
              .deleteById(nodeData.id)
              .then(
                () =>
                  console.log(
                    `Node data for variable ${
                      nodeData.variable
                    } has been deleted (node: ${nodeData.nodeId})`,
                  ),
                () =>
                  console.log(
                    `Error deleting node data definition for variable ${
                      nodeData.variable
                    } (node: ${nodeData.nodeId})`,
                  ),
              );
          }
        },
        () => console.log('Error deleting node data'),
      );

      return await this.nodeRepository
        .deleteById(id)
        .then(() => Promise.resolve({}), () => Promise.reject({}));
    });
  }

  /**
   * Replaces the data of a node except for its id
   * @param body New node data
   */
  @authenticate('BearerStrategy', {whiteList: ['superuser']})
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
        node.waterBodyId = body.waterBodyId;
        this.nodeRepository.save(node);
        return Promise.resolve({});
      },
      () => Promise.reject({}),
    );
  }
}

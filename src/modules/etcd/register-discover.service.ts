import { Injectable, Inject } from '@nestjs/common';
import { Etcd3 } from 'etcd3';

import { InjectEtcd } from './etcd.module';
import { ETCD_CLIENT } from './etcd-constant';

@Injectable()
export class RegisterDiscover {
  // @InjectEtcd()
  @Inject(ETCD_CLIENT)
  private etcdClient: Etcd3;

  /**
   * 服务注册
   * 1. 注意过一段时间续约。采用续约机制能够防止服务挂掉。
   * 2. 相同的服务使用相同的服务名，不同是实例使用不同的 instanceId
   */
  public async registerService(
    serviceName: string,
    instanceId: string,
    metadata: any,
  ) {
    const key = `blog.${serviceName}.${instanceId}`;
    // 续约时间为10s，过期后会自动删除
    const lease = this.etcdClient.lease(10);
    // 如果租约到期后，自动续约
    lease.on('lost', async () => {
      console.log('租约到期了，重新续约...');
      await this.registerService(serviceName, instanceId, metadata);
    });
    await lease.put(key).value(JSON.stringify(metadata));
  }

  /**
   * 服务发现
   * !todo: etcd并没有一个好的负载均衡策略，需要自己实现。后期可能需要使用其他的发现注册服务，比如Eureka等。
   * 由于上述问题的存在，目前采用单例部署的模式，只会存在一个服务！
   */
  public async discoverService(serviceName: string) {
    const instances = await this.etcdClient
      .getAll()
      .prefix(`services.${serviceName}`)
      .strings('utf-8');
    return Object.entries(instances).map(([key, value]) => JSON.parse(value));
  }

  /**
   * 监听服务变更
   * * 服务节点删除后，调用 callback 传入回调的值
   */
  public async watchService(
    serviceName: string,
    callback: (param: Array<any>) => void,
  ) {
    // 建立一个 watcher
    const watcher = await this.etcdClient
      .watch()
      .prefix(`services.${serviceName}`)
      .create();
    watcher
      .on('put', async (event) => {
        console.log('新的服务添加: ', event.key.toString());
        callback(await this.discoverService(serviceName));
      })
      .on('delete', async (event) => {
        console.log('服务节点删除: ', event.key.toString());
        callback(await this.discoverService(serviceName));
      });
  }
}

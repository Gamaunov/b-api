import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DevicesRepository } from '../../infrastructure/devices.repository';
import { DevicesQueryRepository } from '../../infrastructure/devices.query.repository';

export class UpdateTokensCommand {
  constructor(public token: any, public ip: string, public userAgent: string) {}
}

@CommandHandler(UpdateTokensCommand)
export class UpdateTokensUseCase
  implements ICommandHandler<UpdateTokensCommand>
{
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly devicesQueryRepository: DevicesQueryRepository,
  ) {}

  async execute(command: UpdateTokensCommand): Promise<boolean> {
    const device = await this.devicesQueryRepository.findDeviceByDeviceId(
      command.token.deviceId,
    );

    if (!device) {
      return null;
    }

    return this.devicesRepository.updateDevice(
      device.deviceId,
      command.token,
      command.ip,
      command.userAgent,
    );
  }
}

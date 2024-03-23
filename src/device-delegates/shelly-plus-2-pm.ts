import {
  ShellyPlus2Pm,
  ShellyPlus2PmRev1,
  Input,
  Switch,
  SwitchConfig,
} from 'shellies-ng';

import { DeviceDelegate } from './base';

import {
  ReadonlySwitchAbility,
  ServiceLabelAbility,
  StatelessProgrammableSwitchAbility,
} from '../abilities';

export interface AddDetachedInputOptions {
  /**
   * Whether the accessory should be active.
   */
  active: boolean;
}

/**
 * Handles Shelly Plus 2 PM devices.
 */
export class ShellyPlus2PmDelegate extends DeviceDelegate {
  protected setup() {
    const d = this.device as ShellyPlus2Pm;
    const isCover = d.profile === 'cover';

    this.addCover(d.cover0, { active: isCover });

    this.addDetachedInput(d.input0, d.switch0, { active: !isCover });
    this.addDetachedInput(d.input1, d.switch1, { active: !isCover });

    this.addSwitch(d.switch0, { active: !isCover });
    this.addSwitch(d.switch1, { active: !isCover });
  }

  protected addDetachedInput(input: Input, swtch: Switch, opts?: Partial<AddDetachedInputOptions>) {
    const o = opts ?? {};

    const id = `input-${input.id}`;
    const inputIsButton = input.config?.type === 'button';

    // create an accessory for all button inputs
    const detachedInputAccessory = this.createAccessory(
      id,
      null,
      new StatelessProgrammableSwitchAbility(input).setActive(inputIsButton),
      new ReadonlySwitchAbility(input).setActive(!inputIsButton),
      new ServiceLabelAbility(),
    ).setActive(false);

    swtch.getConfig().then((config: SwitchConfig) => {
      detachedInputAccessory.setActive(o.active !== false && config.in_mode === 'detached');
    });

    return detachedInputAccessory;
  }
}

DeviceDelegate.registerDelegate(
  ShellyPlus2PmDelegate,
  ShellyPlus2Pm,
  ShellyPlus2PmRev1,
);

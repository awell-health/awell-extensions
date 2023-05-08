import type {
  Fields as FieldsType,
  Settings as SettingsType,
  WrappedOnActivityCreated,
  ActivityWrapperInjector,
  RequiredServices,
  ActionWithServices,
} from '../types'

export const wrapActivity =
  <AdditionalArgs extends unknown[], Services extends RequiredServices>(
    injector: ActivityWrapperInjector<AdditionalArgs, Services>
  ) =>
  <
    Fields extends FieldsType,
    Settings extends SettingsType,
    DPKeys extends string = string
  >(
    wrappedFunction: WrappedOnActivityCreated<
      AdditionalArgs,
      Fields,
      Settings,
      DPKeys,
      Services
    >
  ): ActionWithServices<
    Fields,
    Settings,
    Services,
    DPKeys
  >['onActivityCreated'] =>
  async (...args) => {
    await wrappedFunction(...args, ...injector(...args))
  }

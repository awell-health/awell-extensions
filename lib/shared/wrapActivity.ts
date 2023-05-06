import type {
  Action,
  Fields as FieldsType,
  Settings as SettingsType,
  WrappedOnActivityCreated,
  ActivityWrapperInjector,
} from '../types'

type MultipleInjectors<AdditionalArgs extends unknown[][]> = {
  [N in keyof AdditionalArgs]: ActivityWrapperInjector<AdditionalArgs[N]>
}

type Flatten<T> = T extends []
  ? []
  : T extends [infer T0]
  ? [...Flatten<T0>]
  : T extends [infer T0, ...infer Ts]
  ? [...Flatten<T0>, ...Flatten<Ts>]
  : [T]

export const wrapActivity =
  <AdditionalArgs extends unknown[][]>(
    ...injectors: MultipleInjectors<AdditionalArgs>
  ) =>
  <
    Fields extends FieldsType,
    Settings extends SettingsType,
    DPKeys extends string = string
  >(
    wrappedFunction: WrappedOnActivityCreated<
      Flatten<AdditionalArgs>,
      Fields,
      Settings,
      DPKeys
    >
  ): Action<Fields, Settings, DPKeys>['onActivityCreated'] =>
  async (...args) => {
    console.log(injectors)
    await wrappedFunction(
      ...args,
      ...(injectors.flatMap((injector) =>
        injector(...args)
      ) as Flatten<AdditionalArgs>)
    )
  }

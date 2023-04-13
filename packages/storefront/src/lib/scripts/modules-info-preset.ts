type ModulesInfoPreset = typeof window.storefront.modulesInfoPreset;

const checkObjNotNull = (obj: { [k: string]: any }) => {
  return Object.values(obj).filter((val) => val).length;
};

const getModulesInfoPreset = (settingsModules = globalThis.storefront.settings.modules) => {
  const modulesInfoPreset: ModulesInfoPreset = {};
  if (settingsModules) {
    const settingsPayments = settingsModules.list_payments;
    if (settingsPayments) {
      const settingsDiscount = settingsPayments.discount_option;
      if (settingsDiscount && checkObjNotNull(settingsDiscount)) {
        modulesInfoPreset.list_payments = { discount_option: settingsDiscount };
      }

      const settingsInstallments = settingsPayments.installments_option;
      if (settingsInstallments?.max_number) {
        if (!modulesInfoPreset.list_payments) modulesInfoPreset.list_payments = {};
        modulesInfoPreset.list_payments.installments_option = settingsInstallments as
          { max_number: number };
      }

      const settingsPointsPrograms = settingsPayments.loyalty_points_programs || {};
      if (!Object.keys(settingsPointsPrograms).length) {
        const pointsProgram = { ...settingsPayments.loyalty_points_program };
        if (pointsProgram?.id && pointsProgram.ratio) {
          const { id } = pointsProgram;
          delete pointsProgram.id;
          settingsPointsPrograms[id] = pointsProgram as { ratio: number };
        }
      }
      if (Object.keys(settingsPointsPrograms).length) {
        if (!modulesInfoPreset.list_payments) modulesInfoPreset.list_payments = {};
        modulesInfoPreset.list_payments.loyalty_points_programs = settingsPointsPrograms;
      }
    }

    const settingsShipping = settingsModules.calculate_shipping;
    const freeShippingFromValue = settingsShipping?.free_shipping_from_value;
    if (typeof freeShippingFromValue === 'number') {
      modulesInfoPreset.calculate_shipping = {
        free_shipping_from_value: freeShippingFromValue,
      };
    }
  }
  return modulesInfoPreset;
};

const loadingGlobalInfoPreset: Promise<ModulesInfoPreset> = new Promise((resolve) => {
  if (import.meta.env.SSR) {
    global.storefront.onLoad(() => {
      resolve(getModulesInfoPreset());
    });
  } else {
    window.storefront.modulesInfoPreset = getModulesInfoPreset();
    resolve(window.storefront.modulesInfoPreset);
  }
});

export default loadingGlobalInfoPreset;

export { getModulesInfoPreset, loadingGlobalInfoPreset };

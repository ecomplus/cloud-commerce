const checkObjNotNull = (obj: { [k: string]: any }) => {
  return Object.values(obj).filter((val) => val).length;
};

const modulesInfoPreset: typeof window.storefront.modulesInfoPreset = {};
const settingsModules = window.storefront.settings.modules;
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
  if (settingsShipping && settingsShipping.free_shipping_from_value) {
    modulesInfoPreset.calculate_shipping = settingsShipping;
  }
}

window.storefront.modulesInfoPreset = modulesInfoPreset;

export default modulesInfoPreset;

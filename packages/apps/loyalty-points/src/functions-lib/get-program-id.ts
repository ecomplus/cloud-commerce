export default (
  programRule: { program_id: string; name: string; },
  index: number,
) => {
  let programId = `lpt__${index}`;
  if (programRule.program_id) {
    programId = programRule.program_id;
  } else if (programRule.name && typeof programRule.name === 'string') {
    programId = (`p0_${programRule.name.toLowerCase()}`)
      .replace(/\n\s/g, '_')
      .replace(/__/g, '_')
      .replace(/áàãâ/g, 'a')
      .replace(/éê/g, 'e')
      .replace(/óõô/g, 'o')
      .replace(/í/g, 'e')
      .replace(/ú/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 30);
  }

  return programId;
};

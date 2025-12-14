export const rollDice = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

export const rollMultipleDice = (count: number, sides: number): number => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += rollDice(sides);
  }
  return total;
};

export const parseDiceFormula = (formula: string): { total: number; rolls: number[] } => {
  // "3D6*5" や "(2D6+6)*5" のような文字列をパース
  let multiplier = 1;
  let baseFormula = formula;

  // 乗算を処理
  if (formula.includes('*')) {
    const parts = formula.split('*');
    baseFormula = parts[0].replace(/[()]/g, ''); // 括弧を削除
    multiplier = parseInt(parts[1]);
  }

  // ダイス式をパース: "3D6" や "2D6+6"
  const match = baseFormula.match(/(\d+)D(\d+)(?:\+(\d+))?/i);
  if (!match) return { total: 0, rolls: [] };

  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const bonus = match[3] ? parseInt(match[3]) : 0;

  const rolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const roll = rollDice(sides);
    rolls.push(roll);
    sum += roll;
  }

  const total = (sum + bonus) * multiplier;

  return { total, rolls };
};

export const calculateDB = (str: number, siz: number): string => {
  const total = str + siz;
  
  if (total <= 64) return '-2';
  if (total <= 84) return '-1';
  if (total <= 124) return '0';
  if (total <= 164) return '+1D4';
  if (total <= 204) return '+1D6';
  if (total <= 284) return '+2D6';
  if (total <= 364) return '+3D6';
  if (total <= 444) return '+4D6';
  return '+5D6';
};

export const calculateBuild = (str: number, siz: number): number => {
  const total = str + siz;
  
  if (total <= 64) return -2;
  if (total <= 84) return -1;
  if (total <= 124) return 0;
  if (total <= 164) return 1;
  if (total <= 204) return 2;
  if (total <= 284) return 3;
  if (total <= 364) return 4;
  if (total <= 444) return 5;
  return 6;
};

export const calculateMOV = (str: number, dex: number, siz: number): number => {
  if (str < siz && dex < siz) return 7;
  if (str > siz && dex > siz) return 9;
  return 8;
};

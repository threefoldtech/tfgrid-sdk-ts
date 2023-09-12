export interface ayesAndNayesInterface {
  farmId: number;
  weight: number;
}
export interface proposalInterface {
  threshold: number;
  ayes: ayesAndNayesInterface[];
  nayes: ayesAndNayesInterface[];
  vetos: number;
  end: any;
  hash: any;
  action: string;
  description: string;
  link: string;
  ayesProgress: number;
  nayesProgress: number;
}

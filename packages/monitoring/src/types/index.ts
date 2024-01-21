export interface ILivenessChecker {
  ServiceName: string;
  ServiceURL: string;
  LiveChecker: () => Promise<boolean>;
  disconnectHandler?: () => void;
}

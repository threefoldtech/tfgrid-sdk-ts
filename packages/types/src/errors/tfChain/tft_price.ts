export enum TFTPrice {
  ErrFetchingPrice = 208,
  OffchainSignedTxError,
  NoLocalAcctForSigning,
  AccountUnauthorizedToSetPrice,
  MaxPriceBelowMinPriceError,
  MinPriceAboveMaxPriceError,
  IsNotAnAuthority,
  WrongAuthority,
}

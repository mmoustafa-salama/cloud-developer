import Axios from 'axios';
import { decode } from 'jsonwebtoken'
import { JwtPayload } from './JwtPayload'
import { SigningKey } from './SigningKey';

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

/**
 * Find the signature verification key using the value of the kid property
 * @param kid the unique identifier for the key
 * @param jwksUrl a url of JSON file containing JWKS (set of keys containing the public keys)
 */
export async function getSigningKey(kid, jwksUrl) {
  const signingKeys = await getSigningKeys(jwksUrl);
  const signingKey = signingKeys.find(key => key.kid === kid);
  if (!signingKey) {
    throw new Error(`Unable to find a signing key that matches '${kid}'`);
  }
  return signingKey;
};

async function getSigningKeys(jwksUrl): Promise<SigningKey[]> {
  const { data } = await Axios.get(jwksUrl);
  const signingKeys = data.keys
    .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signing
      && key.kty === 'RSA'           // We are only supporting RSA (RS256)
      && key.kid                     // The `kid` must be present to be useful for later
      && key.x5c && key.x5c.length   // Has useful public keys
    ).map(key => {
      return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) } as SigningKey;
    });

  if (!signingKeys.length) {
    throw new Error('The JWKS endpoint did not contain any signing keys');
  }
  return signingKeys;
};

export function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}
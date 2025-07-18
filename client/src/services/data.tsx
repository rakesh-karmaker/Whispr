import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

export const allowedSocialTypes = [
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "github",
  "website",
] as const;

export const allowedSocialTypesIcons = {
  facebook: <FaFacebook />,
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  linkedin: <FaLinkedin />,
  github: <FaGithub />,
  website: <FaLinkedin />,
};

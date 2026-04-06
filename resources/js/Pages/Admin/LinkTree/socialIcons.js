// resources/js/Pages/LinkTree/socialIcons.js
import { FaFacebook, FaYoutube, FaTiktok, FaWhatsapp,
         FaInstagram, FaLinkedin, FaGithub, FaSnapchat } from 'react-icons/fa';
import { FaXTwitter, FaThreads } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import { TbWorldWww } from 'react-icons/tb';
import { RiWhatsappFill } from 'react-icons/ri';

export const SOCIAL_ICON_MAP = {
  facebook:         FaFacebook,
  youtube:          FaYoutube,
  tiktok:           FaTiktok,
  whatsapp:         FaWhatsapp,
  whatsapp_channel: RiWhatsappFill,   // distinct icon for channel
  instagram:        FaInstagram,
  twitter:          FaXTwitter,
  linkedin:         FaLinkedin,
  github:           FaGithub,
  email:            MdEmail,
  website:          TbWorldWww,
  threads:          FaThreads,
  snapchat:         FaSnapchat,
};
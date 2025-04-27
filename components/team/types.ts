import { StaticImageData } from "next/image";
import { ReactNode } from "react";

export interface SocialLink {
  platform:
    | "linkedin"
    | "twitter"
    | "github"
    | "instagram"
    | "facebook"
    | "youtube"
    | "website"
    | "email"
    | string;
  url: string;
  icon?: ReactNode;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  bio?: string;
  image?: string | StaticImageData;
  email?: string;
  phone?: string;
  socialLinks?: SocialLink[];
  tags?: string[];
  location?: string;
  joinDate?: string;
  featured?: boolean;
}

export interface TeamDepartment {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
}

export interface TeamProps {
  members: TeamMember[];
  departments?: TeamDepartment[];
  title?: string;
  description?: string;
  showFilters?: boolean;
  layout?: "grid" | "list";
  columns?: 2 | 3 | 4;
  expandableBio?: boolean;
  showSocialLinks?: boolean;
  showEmail?: boolean;
  showDepartment?: boolean;
  showLocation?: boolean;
  className?: string;
  memberClassName?: string;
  animationVariant?: "fade" | "slide" | "scale" | "none";
  enableSearch?: boolean;
  enableDepartmentFilter?: boolean;
  initialDepartmentFilter?: string;
}

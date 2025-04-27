import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import {
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Facebook,
  Youtube,
  Globe,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TeamMember, SocialLink } from "./types";

interface TeamMemberCardProps {
  member: TeamMember;
  expandableBio?: boolean;
  showSocialLinks?: boolean;
  showEmail?: boolean;
  showDepartment?: boolean;
  showLocation?: boolean;
  className?: string;
  animationVariant?: "fade" | "slide" | "scale" | "none";
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  expandableBio = true,
  showSocialLinks = true,
  showEmail = true,
  showDepartment = true,
  showLocation = true,
  className,
  animationVariant = "fade",
}) => {
  const [bioExpanded, setBioExpanded] = useState(false);

  const {
    name,
    role,
    department,
    bio,
    image,
    email,
    phone,
    socialLinks,
    location,
    featured,
  } = member;

  const toggleBio = () => {
    setBioExpanded((prev) => !prev);
  };

  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "github":
        return <Github className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "website":
      case "web":
        return <Globe className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  // Animation variants
  const animationVariants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.5 } },
    },
    slide: {
      hidden: { y: 50, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    },
    scale: {
      hidden: { scale: 0.8, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
    },
    none: {
      hidden: {},
      visible: {},
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={animationVariants[animationVariant]}
    >
      <Card
        className={cn(
          "h-full overflow-hidden transition-all duration-200",
          featured && "border-primary shadow-md",
          className
        )}
      >
        {/* Image */}
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
              <span className="text-4xl font-bold">{name.charAt(0)}</span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-gray-600">{role}</p>

          {showDepartment && department && (
            <p className="text-sm text-gray-500 mt-1">{department}</p>
          )}

          {showLocation && location && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{location}</span>
            </div>
          )}

          {bio && expandableBio ? (
            <div className="mt-4">
              <div
                className={cn(
                  "prose prose-sm max-w-none transition-all duration-300",
                  !bioExpanded && "line-clamp-2"
                )}
              >
                <p>{bio}</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBio}
                className="mt-2 h-auto p-0 text-primary"
              >
                <span className="text-xs mr-1">
                  {bioExpanded ? "Voir moins" : "Voir plus"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    bioExpanded && "rotate-180"
                  )}
                />
              </Button>
            </div>
          ) : bio ? (
            <div className="mt-4 prose prose-sm max-w-none">
              <p>{bio}</p>
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="px-4 pt-0 pb-4 flex flex-wrap items-center gap-2">
          {/* Contact info */}
          {showEmail && email && (
            <Link
              href={`mailto:${email}`}
              className="text-gray-500 hover:text-primary rounded-full p-1 transition-colors"
              title={`Envoyer un email à ${name}`}
            >
              <Mail className="h-4 w-4" />
            </Link>
          )}

          {phone && (
            <Link
              href={`tel:${phone}`}
              className="text-gray-500 hover:text-primary rounded-full p-1 transition-colors"
              title={`Appeler ${name}`}
            >
              <Phone className="h-4 w-4" />
            </Link>
          )}

          {/* Social links */}
          {showSocialLinks && socialLinks && socialLinks.length > 0 && (
            <>
              {socialLinks.map((link: SocialLink, index: number) => (
                <Link
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary rounded-full p-1 transition-colors"
                  title={`${name} sur ${link.platform}`}
                >
                  {link.icon || renderSocialIcon(link.platform)}
                </Link>
              ))}
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

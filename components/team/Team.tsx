import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamMemberCard } from "./TeamMemberCard";
import { TeamMember, TeamDepartment, TeamProps } from "./types";

export const Team: React.FC<TeamProps> = ({
  members,
  departments,
  title,
  description,
  showFilters = true,
  layout = "grid",
  columns = 3,
  expandableBio = true,
  showSocialLinks = true,
  showEmail = true,
  showDepartment = true,
  showLocation = true,
  className,
  memberClassName,
  animationVariant = "fade",
  enableSearch = true,
  enableDepartmentFilter = true,
  initialDepartmentFilter = "all",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDepartment, setActiveDepartment] = useState(
    initialDepartmentFilter || "all"
  );

  // Générer les départements s'ils ne sont pas fournis
  const processedDepartments = useMemo(() => {
    if (!departments) {
      // Si aucun département n'est fourni mais que les membres ont des départements définis
      // Générer automatiquement les départements
      const departmentMap = new Map<string, TeamDepartment>();

      members.forEach((member) => {
        if (member.department) {
          const departmentId = member.department
            .toLowerCase()
            .replace(/\s+/g, "-");

          if (!departmentMap.has(departmentId)) {
            departmentMap.set(departmentId, {
              id: departmentId,
              name: member.department,
              members: [],
            });
          }

          const department = departmentMap.get(departmentId);
          if (department) {
            department.members.push(member);
          }
        }
      });

      const generatedDepartments = Array.from(departmentMap.values());

      // Ajouter un département "Tous" si des départements ont été générés
      if (generatedDepartments.length > 0) {
        return [
          {
            id: "all",
            name: "Tous",
            members: members,
          },
          ...generatedDepartments,
        ];
      }

      return [];
    }

    return departments;
  }, [departments, members]);

  // Réinitialiser le département actif quand les départements changent
  useEffect(() => {
    if (
      processedDepartments.length > 0 &&
      !processedDepartments.some((dep) => dep.id === activeDepartment)
    ) {
      setActiveDepartment(processedDepartments[0].id);
    }
  }, [processedDepartments, activeDepartment]);

  // Filtrer les membres selon la recherche et le département
  const filteredMembers = useMemo(() => {
    let result = members;

    // Filtrer par département
    if (activeDepartment && activeDepartment !== "all") {
      result = result.filter(
        (member) =>
          member.department &&
          member.department.toLowerCase().replace(/\s+/g, "-") ===
            activeDepartment
      );
    }

    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.role.toLowerCase().includes(query) ||
          (member.department &&
            member.department.toLowerCase().includes(query)) ||
          (member.bio && member.bio.toLowerCase().includes(query)) ||
          (member.tags &&
            member.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    return result;
  }, [members, activeDepartment, searchQuery]);

  // Définition des styles de grille en fonction du nombre de colonnes
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className={cn("py-12", className)}>
      <div className="container mx-auto px-4">
        {/* En-tête de section */}
        {(title || description) && (
          <div className="text-center mb-12">
            {title && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                {title}
              </motion.h2>
            )}

            {description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-gray-600 max-w-3xl mx-auto"
              >
                {description}
              </motion.p>
            )}
          </div>
        )}

        {/* Filtres et recherche */}
        {showFilters && (
          <div className="mb-8">
            {enableSearch && (
              <div className="relative max-w-md mx-auto mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Rechercher un membre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {enableDepartmentFilter && processedDepartments.length > 0 && (
              <Tabs
                value={activeDepartment}
                onValueChange={setActiveDepartment}
                className="w-full"
              >
                <TabsList className="w-full max-w-4xl mx-auto flex flex-wrap justify-center">
                  {processedDepartments.map((department) => (
                    <TabsTrigger
                      key={department.id}
                      value={department.id}
                      className="flex items-center gap-1"
                    >
                      {department.name}
                      <span className="ml-1 text-xs bg-primary/10 rounded-full px-2 py-0.5">
                        {department.members.length}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
        )}

        {/* Affichage des membres */}
        {layout === "grid" ? (
          <div className={cn("grid gap-6", gridClasses[columns])}>
            {filteredMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                expandableBio={expandableBio}
                showSocialLinks={showSocialLinks}
                showEmail={showEmail}
                showDepartment={showDepartment}
                showLocation={showLocation}
                className={memberClassName}
                animationVariant={animationVariant}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                expandableBio={expandableBio}
                showSocialLinks={showSocialLinks}
                showEmail={showEmail}
                showDepartment={showDepartment}
                showLocation={showLocation}
                className={cn("max-w-4xl mx-auto", memberClassName)}
                animationVariant={animationVariant}
              />
            ))}
          </div>
        )}

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Aucun membre ne correspond à votre recherche.
            </p>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setActiveDepartment("all");
              }}
              className="mt-4"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

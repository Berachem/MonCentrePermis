import React from "react";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import Logo_MCP from "../assets/images/branding/logo_moncentrepermis_green.png";
import SideBarCustom from "../components/Home/SideBarCustom";

const About: React.FC = () => {

  // Équipe de développeurs
  const developers = [
    {
      name: "Berachem MARKRIA",
      role: "Développeur Full-Stack",
      avatar: "https://www.berachem.dev/assets/moi_bg-VByniUW-.png",
      github: "https://github.com/Berachem",
      linkedin: "https://www.linkedin.com/in/berachem-markria",
    },
    {
      name: "Joshua LEMOINE",
      role: "Développeur Full-Stack",
      avatar:
        "https://media.licdn.com/dms/image/v2/C4E03AQE1Ef-XouAI0g/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1645373845460?e=1750291200&v=beta&t=A1fqiLIbIuZib1oBGgZahyvpneP2zlM45OAAAPFirM0",
      github: "https://github.com/LemoineJoshua",
      linkedin: "https://www.linkedin.com/in/joshua-lemoine",
    },
    {
      name: "Ismaël MOSTEFA-SBA",
      role: "Développeur Full-Stack",
      avatar:
        "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg",
      github: "-",
      linkedin: "https://www.linkedin.com/in/ismael-mostefasba/",
    },
    {
      name: "Abdallah M'CHIRI",
      role: "Développeur Full-Stack",
      avatar:
        "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg",
      github: "https://github.com/amchiri",
      linkedin: "https://www.linkedin.com/in/abdallah-m-chiri-764402222/",
    },
    {
      name: "Alessandro VILLA",
      role: "Développeur Full-Stack",
      avatar:
        "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg",
      github: "#",
      linkedin: "#",
    },
  ];

  // Fonctionnalités principales
  const features = [
    {
      icon: "pi pi-map",
      title: "Parcours d'examen interactifs",
      description:
        "Visualisez en temps réel les circuits d'examen pour vous familiariser avec les zones de test.",
    },
    {
      icon: "pi pi-calendar",
      title: "Cours et parcours de conduite",
      description:
        "Apprennez à conduire directement sur les circuits d'examen avec des moniteurs qualifiés.",
    },
    {
      icon: "pi pi-bolt",
      title: "Gagnez en efficacité",
      description:
        "Optimisez votre temps d'apprentissage avec des outils numériques adaptés à vos besoins.",
    },
    {
      icon: "pi pi-chart-bar",
      title: "Suivi de progression",
      description:
        "Suivez votre évolution et identifiez les points à améliorer.",
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen px-4 py-8 md:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="text-center">
          <div className="flex items-center justify-center w-full mt-4">
            <SideBarCustom />
            <img src={Logo_MCP} alt="logo" className="mx-auto w-52 md:w-64" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-xl mt-4 mb-6">
            La solution moderne pour la formation au permis de conduire
          </p>
          <div className="flex items-center justify-center my-6">
            <div className="h-px bg-gray-300 dark:bg-gray-700 w-24"></div>
            <span className="mx-4 px-4 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">À PROPOS</span>
            <div className="h-px bg-gray-300 dark:bg-gray-700 w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section concept */}
        <div className="w-full lg:w-3/4 mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-gray-800 dark:text-gray-100 font-bold text-3xl mb-4">Notre Concept</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                <span className="font-bold text-green-600">MonCentrePermis</span> est né d'une vision simple : moderniser
                et simplifier l'expérience des candidats au permis de conduire.
                Notre plateforme connecte les élèves, les moniteurs et les
                centres d'examen pour offrir une formation plus efficace et
                transparente.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mt-4">
                En permettant la visualisation des parcours d'examen, la gestion
                des réservations et le suivi de progression, nous transformons
                l'apprentissage de la conduite en une expérience numérique,
                accessible et personnalisée.
              </p>
            </div>

            <div className="flex items-center justify-center my-8">
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-grow"></div>
              <div className="mx-4 p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <i className="pi pi-star text-green-600 dark:text-green-400"></i>
              </div>
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-grow"></div>
            </div>

            {/* Fonctionnalités principales */}
            <h3 className="text-gray-800 dark:text-gray-100 font-semibold text-2xl mb-6 text-center">
              Nos fonctionnalités clés
            </h3>
            <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="w-full">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                    <div className="flex items-center mb-4">
                      <div className="p-2 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-full mr-4">
                        <i className={`${feature.icon} text-xl text-green-600 dark:text-green-400`}></i>
                      </div>
                      <h4 className="text-gray-800 dark:text-gray-100 font-semibold text-xl">
                        {feature.title}
                      </h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center my-8">
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-grow"></div>
              <div className="mx-4 p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <i className="pi pi-users text-green-600 dark:text-green-400"></i>
              </div>
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-grow"></div>
            </div>

            {/* Section équipe */}
            <div>
              <h3 className="text-gray-800 dark:text-gray-100 font-semibold text-2xl mb-4 text-center">
                Notre équipe
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-center mb-8">
                Derrière MonCentrePermis se trouve une équipe passionnée de
                développeurs et designers qui travaillent à améliorer
                continuellement l'expérience utilisateur.
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                {developers.map((dev, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-6 text-center w-full max-w-[280px]"
                  >
                    <Avatar
                      image={dev.avatar}
                      size="xlarge"
                      shape="circle"
                      className="mb-4"
                      pt={{ image: { className: "w-24  object-cover" } }}
                    />
                    <h4 className="text-gray-800 dark:text-gray-100 font-semibold text-xl mb-2">
                      {dev.name}
                    </h4>
                    <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full mb-4">
                      {dev.role}
                    </span>
                    <div className="flex justify-center gap-3">
                      <Button
                        icon="pi pi-github"
                        className="text-white rounded-lg bg-gray-800 hover:bg-gray-900 border-gray-800 h-11 w-11"
                        onClick={() => window.open(dev.github, "_blank")}
                      />
                      <Button
                        icon="pi pi-linkedin"
                        className="text-white rounded-lg bg-blue-600 hover:bg-blue-700 border-blue-600 h-11 w-11"
                        onClick={() => window.open(dev.linkedin, "_blank")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dans un cadre scolaire (ESIEE Paris) */}
            <div className="flex items-center justify-center my-8">
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-grow"></div>
              <div className="mx-4 p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <i className="pi pi-graduation-cap text-green-600 dark:text-green-400"></i>
              </div>
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-grow"></div>
            </div>

            <div className="text-center mt-8">
              <h3 className="text-gray-800 dark:text-gray-100 font-semibold text-2xl mb-4">
                Développé dans un cadre scolaire
              </h3>
              <img
                src="https://www.cci-paris-idf.fr/sites/default/files/inline-images/ESIEE_Paris_logo.png"
                alt="ESIEE Paris"
                className="w-24 h-auto mb-4 mx-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="text-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          © 2024-{new Date().getFullYear()} MonCentrePermis
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          Développé avec{" "}
          <i className="pi pi-heart-fill text-red-500 mx-1 text-xs"></i>
          en utilisant React, TypeScript et PrimeReact
        </p>
      </div>
    </div>
  );
};

export default About;

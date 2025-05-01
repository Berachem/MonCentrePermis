import React from "react";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { useNavigate } from "react-router-dom";

import Logo_MCP from "../assets/images/branding/logo_moncentrepermis.png";
import SideBarCustom from "../components/Home/SideBarCustom";

const About: React.FC = () => {
  const navigate = useNavigate();

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
    <div className="surface-ground px-4  md:px-6 lg:px-8">
      <div className="flex flex-column md:flex-row align-items-center justify-content-center mb-5">
        <div className="text-center">
          <div className="flex align-items-center justify-content-center col-12 mt-4">
            <SideBarCustom />
            <img src={Logo_MCP} alt="logo" className="mx-auto md:w-2 w-13rem" />
          </div>
          <p className="text-700 text-xl mt-0 mb-4">
            La solution moderne pour la formation au permis de conduire
          </p>
          <Divider align="center">
            <span className="p-tag">À PROPOS</span>
          </Divider>
        </div>
      </div>

      <div className="grid">
        {/* Section concept */}
        <div className="col-12 lg:col-8 lg:col-offset-2">
          <Card className="shadow-4">
            <div className="text-center mb-5">
              <h2 className="text-900 font-bold text-3xl">Notre Concept</h2>
              <p className="text-700 line-height-3 text-lg">
                <b>MonCentrePermis</b> est né d'une vision simple : moderniser
                et simplifier l'expérience des candidats au permis de conduire.
                Notre plateforme connecte les élèves, les moniteurs et les
                centres d'examen pour offrir une formation plus efficace et
                transparente.
              </p>
              <p className="text-700 line-height-3 text-lg">
                En permettant la visualisation des parcours d'examen, la gestion
                des réservations et le suivi de progression, nous transformons
                l'apprentissage de la conduite en une expérience numérique,
                accessible et personnalisée.
              </p>
            </div>

            <Divider align="center">
              <i className="pi pi-star"></i>
            </Divider>

            {/* Fonctionnalités principales */}
            <h3 className="text-900 font-medium text-xl mb-4 text-center">
              Nos fonctionnalités clés
            </h3>
            <div className="grid">
              {features.map((feature, index) => (
                <div key={index} className="col-12 md:col-6 mb-4">
                  <Card className="h-full surface-0 shadow-1 hover:shadow-3 transition-duration-200">
                    <div className="flex align-items-center mb-3">
                      <i
                        className={`${feature.icon} text-4xl text-primary mr-3`}
                      ></i>
                      <h4 className="text-900 font-medium text-xl m-0">
                        {feature.title}
                      </h4>
                    </div>
                    <p className="text-700 line-height-3 m-0">
                      {feature.description}
                    </p>
                  </Card>
                </div>
              ))}
            </div>

            <Divider align="center">
              <i className="pi pi-users"></i>
            </Divider>

            {/* Section équipe */}
            <div>
              <h3 className="text-900 font-medium text-xl mb-4 text-center">
                Notre équipe
              </h3>
              <p className="text-700 text-center mb-5">
                Derrière MonCentrePermis se trouve une équipe passionnée de
                développeurs et designers qui travaillent à améliorer
                continuellement l'expérience utilisateur.
              </p>

              <div className="flex flex-column md:flex-row justify-content-center align-items-center gap-5">
                {developers.map((dev, index) => (
                  <Card
                    key={index}
                    className="shadow-2 text-center p-4"
                    style={{ maxWidth: "280px" }}
                  >
                    <Avatar
                      image={dev.avatar}
                      size="xlarge"
                      shape="circle"
                      className="mb-3"
                    />
                    <h4 className="text-900 font-medium text-xl mb-2">
                      {dev.name}
                    </h4>
                    <Chip
                      label={dev.role}
                      className="mb-3 bg-primary-100 text-primary-900"
                    />
                    <div className="flex justify-content-center gap-2">
                      <Button
                        icon="pi pi-github"
                        className="p-button-rounded "
                        onClick={() => window.open(dev.github, "_blank")}
                      />
                      <Button
                        icon="pi pi-linkedin"
                        className="p-button-rounded p-button-info"
                        onClick={() => window.open(dev.linkedin, "_blank")}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Dans un cadre scolaire (ESIEE Paris) */}
            <Divider align="center">
              <i className="pi pi-graduation-cap"></i>
            </Divider>

            <div className="text-center mt-5">
              <h3 className="text-900 font-medium text-xl mb-4">
                Développé dans un cadre scolaire
              </h3>
              <img
                src="https://www.cci-paris-idf.fr/sites/default/files/inline-images/ESIEE_Paris_logo.png"
                alt="ESIEE Paris"
                className="w-6rem mb-3"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Pied de page */}
      <div className="text-center mt-5 pt-5">
        <p className="text-600 mb-2">
          © 2024-{new Date().getFullYear()} MonCentrePermis
        </p>
        <p className="text-500 text-sm">
          Développé avec{" "}
          <i
            className="pi pi-heart-fill text-danger mx-1"
            style={{ fontSize: "0.7rem" }}
          ></i>
          en utilisant React, TypeScript et PrimeReact
        </p>
      </div>
    </div>
  );
};

export default About;

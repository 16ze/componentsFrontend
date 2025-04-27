"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  PlusCircle,
} from "lucide-react";

/**
 * Composant pour afficher et gérer les méthodes de paiement sauvegardées
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.paymentMethods - Liste des méthodes de paiement
 * @param {string} props.selectedMethodId - ID de la méthode sélectionnée
 * @param {boolean} props.isLoading - Indique si le chargement est en cours
 * @param {Function} props.onSelectMethod - Callback lors de la sélection d'une méthode
 * @param {Function} props.onDeleteMethod - Callback lors de la suppression d'une méthode
 * @param {Function} props.onSetDefault - Callback lors de la définition d'une méthode par défaut
 * @param {Function} props.onAddNewMethod - Callback pour ajouter une nouvelle méthode
 * @param {Object} props.styling - Styles personnalisés
 * @returns {JSX.Element} Composant de méthodes de paiement
 */
const SavedPaymentMethods = ({
  paymentMethods = [],
  selectedMethodId = null,
  isLoading = false,
  onSelectMethod,
  onDeleteMethod,
  onSetDefault,
  onAddNewMethod,
  styling = {},
}) => {
  const [deleteInProgress, setDeleteInProgress] = useState(null);
  const [defaultInProgress, setDefaultInProgress] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Gère la suppression d'une méthode de paiement
   * @param {Event} e - Événement du clic
   * @param {string} methodId - ID de la méthode à supprimer
   */
  const handleDelete = async (e, methodId) => {
    e.stopPropagation(); // Éviter de sélectionner la méthode

    if (!onDeleteMethod) return;

    try {
      setDeleteInProgress(methodId);
      setError(null);
      await onDeleteMethod(methodId);
    } catch (err) {
      setError(`Erreur lors de la suppression: ${err.message}`);
    } finally {
      setDeleteInProgress(null);
    }
  };

  /**
   * Gère la définition d'une méthode par défaut
   * @param {Event} e - Événement du clic
   * @param {string} methodId - ID de la méthode à définir par défaut
   */
  const handleSetDefault = async (e, methodId) => {
    e.stopPropagation(); // Éviter de sélectionner la méthode

    if (!onSetDefault) return;

    try {
      setDefaultInProgress(methodId);
      setError(null);
      await onSetDefault(methodId);
    } catch (err) {
      setError(`Erreur lors de la définition par défaut: ${err.message}`);
    } finally {
      setDefaultInProgress(null);
    }
  };

  /**
   * Obtenir la classe CSS pour une carte en fonction de son état
   * @param {Object} method - Méthode de paiement
   * @returns {string} Classe CSS
   */
  const getCardClass = (method) => {
    if (selectedMethodId === method.id) {
      return "border-blue-500 bg-blue-50";
    }
    return "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50";
  };

  // Style du conteneur
  const containerStyle = {
    maxWidth: "100%",
    ...styling.container,
  };

  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center py-8"
        style={containerStyle}
      >
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">
          Chargement des méthodes de paiement...
        </span>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div
        className="p-6 border border-gray-200 rounded-lg text-center bg-gray-50"
        style={containerStyle}
      >
        <div className="flex flex-col items-center justify-center">
          <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Aucune méthode de paiement enregistrée
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Ajoutez une carte de crédit pour accélérer vos futurs paiements
          </p>

          {onAddNewMethod && (
            <button
              onClick={onAddNewMethod}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter une méthode de paiement
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={containerStyle}>
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-700">
          Vos méthodes de paiement
        </h3>

        {onAddNewMethod && (
          <button
            onClick={onAddNewMethod}
            className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Ajouter
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`relative flex items-center p-3 border rounded-md cursor-pointer transition-colors ${getCardClass(
              method
            )}`}
            onClick={() => onSelectMethod && onSelectMethod(method.id)}
          >
            {/* Indicateur par défaut */}
            {method.isDefault && (
              <div className="absolute top-0 right-0 -mt-2 -mr-2">
                <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Par défaut
                </div>
              </div>
            )}

            <div className="flex-shrink-0">
              <CreditCard
                className={`h-6 w-6 ${
                  selectedMethodId === method.id
                    ? "text-blue-500"
                    : "text-gray-400"
                }`}
              />
            </div>

            <div className="ml-3 flex-grow">
              <p className="text-sm font-medium text-gray-700">
                {method.brand || "Carte"} •••• {method.last4}
              </p>
              <p className="text-xs text-gray-500">
                Expire {method.expiryMonth}/{method.expiryYear}
                {method.name && ` - ${method.name}`}
              </p>
            </div>

            <div className="flex space-x-2">
              {/* Bouton définir par défaut */}
              {onSetDefault && !method.isDefault && (
                <button
                  onClick={(e) => handleSetDefault(e, method.id)}
                  className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                  disabled={defaultInProgress === method.id}
                  title="Définir comme méthode par défaut"
                >
                  {defaultInProgress === method.id ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                </button>
              )}

              {/* Bouton supprimer */}
              {onDeleteMethod && (
                <button
                  onClick={(e) => handleDelete(e, method.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                  disabled={deleteInProgress === method.id}
                  title="Supprimer cette méthode"
                >
                  {deleteInProgress === method.id ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>

            {selectedMethodId === method.id && (
              <div className="absolute inset-0 border-2 border-blue-500 rounded-md pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedPaymentMethods;

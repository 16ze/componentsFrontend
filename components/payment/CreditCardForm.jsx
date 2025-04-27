"use client";

import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  ArrowRight,
  Shield,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Configuration avancée pour CardElement
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontFamily: "system-ui, sans-serif",
      fontSize: "16px",
      fontWeight: "400",
      color: "#30313d",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#df1b41",
      iconColor: "#df1b41",
    },
  },
  hidePostalCode: true,
};

/**
 * Formulaire de carte de crédit avec validation en temps réel
 * @param {Object} props - Propriétés du composant
 * @param {string} props.clientSecret - Clé secrète client pour le PaymentIntent
 * @param {Object} props.customer - Informations du client
 * @param {Function} props.onPaymentSuccess - Callback lors du succès du paiement
 * @param {Function} props.onPaymentError - Callback lors d'une erreur de paiement
 * @param {boolean} props.saveCard - Enregistrer la carte pour usage futur
 * @param {Function} props.onSaveCardChange - Callback lors du changement d'enregistrement de carte
 * @param {Array} props.savedMethods - Méthodes de paiement enregistrées
 * @param {Object} props.billingDetails - Détails de facturation
 * @param {Object} props.styling - Styles supplémentaires pour le formulaire
 * @returns {JSX.Element} Formulaire de carte
 */
const CreditCardForm = ({
  clientSecret,
  customer,
  onPaymentSuccess,
  onPaymentError,
  saveCard = false,
  onSaveCardChange,
  savedMethods = [],
  billingDetails = {},
  styling = {},
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [cardComplete, setCardComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [savedMethodId, setSavedMethodId] = useState(null);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  // Réinitialiser le statut quand le client secret change
  useEffect(() => {
    setError(null);
    setPaymentSucceeded(false);
    setIsProcessing(false);
  }, [clientSecret]);

  /**
   * Gère la soumission du formulaire de paiement
   * @param {Event} event - Événement de soumission
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js n'est pas encore chargé
      return;
    }

    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let paymentResult;

      // Utiliser une méthode de paiement sauvegardée ou la carte actuellement saisie
      if (savedMethodId) {
        // Confirmer avec une méthode de paiement existante
        paymentResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: savedMethodId,
        });
      } else {
        // Confirmer avec les éléments de carte
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
          throw new Error("Impossible de trouver l'élément de carte");
        }

        // Préparer les détails de facturation
        const paymentMethodData = {
          card: cardElement,
          billing_details: {
            name:
              billingDetails.name ||
              `${customer.firstName} ${customer.lastName}`,
            email: billingDetails.email || customer.email,
            phone: billingDetails.phone || customer.phone,
            address: {
              line1: billingDetails.address1 || customer.address1,
              line2: billingDetails.address2 || customer.address2,
              city: billingDetails.city || customer.city,
              postal_code: billingDetails.postalCode || customer.postalCode,
              country: billingDetails.country || customer.country,
            },
          },
        };

        paymentResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethodData,
          setup_future_usage: saveCard ? "off_session" : undefined,
        });
      }

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      // Paiement réussi
      setPaymentSucceeded(true);

      // Appeler le callback de succès
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentResult.paymentIntent);
      }
    } catch (err) {
      setError(
        err.message || "Une erreur est survenue lors du traitement du paiement"
      );

      // Appeler le callback d'erreur
      if (onPaymentError) {
        onPaymentError(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Gère le changement d'état de la saisie de carte
   * @param {Object} event - Événement de changement
   */
  const handleCardChange = (event) => {
    setCardComplete(event.complete);

    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }

    // Réinitialiser la sélection de méthode sauvegardée si une nouvelle carte est en cours de saisie
    if (event.empty === false && savedMethodId) {
      setSavedMethodId(null);
    }
  };

  /**
   * Gère la sélection d'une méthode de paiement sauvegardée
   * @param {string} methodId - ID de la méthode sélectionnée
   */
  const handleSavedMethodSelect = (methodId) => {
    setSavedMethodId(methodId === savedMethodId ? null : methodId);
  };

  // Style des conteneurs
  const formContainerStyle = {
    maxWidth: "500px",
    ...styling.container,
  };

  if (paymentSucceeded) {
    return (
      <div
        className="p-6 rounded-lg border-2 border-green-200 bg-green-50 text-center"
        style={formContainerStyle}
      >
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h2 className="text-xl font-semibold text-green-700 mb-2">
          Paiement réussi !
        </h2>
        <p className="text-green-600 mb-4">
          Votre paiement a été traité avec succès.
        </p>
        {saveCard && (
          <p className="text-sm text-green-600">
            Votre carte a été enregistrée pour vos prochains achats.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full" style={formContainerStyle}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Méthodes de paiement sauvegardées */}
        {savedMethods.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Vos cartes enregistrées
            </h3>

            <div className="space-y-2">
              {savedMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                    savedMethodId === method.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50"
                  }`}
                  onClick={() => handleSavedMethodSelect(method.id)}
                >
                  <div className="flex-shrink-0">
                    <CreditCard
                      className={`h-6 w-6 ${
                        savedMethodId === method.id
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
                    </p>
                  </div>
                  {savedMethodId === method.id && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-3 text-sm text-gray-500">Ou</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
          </div>
        )}

        {/* Nouvelle carte */}
        {!savedMethodId && (
          <>
            <div className="mb-4">
              <label
                htmlFor="card-element"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Carte de crédit
              </label>

              <div className="p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <CardElement
                  id="card-element"
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardChange}
                />
              </div>

              {/* Option pour enregistrer la carte */}
              {!saveCard && onSaveCardChange && (
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => onSaveCardChange(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Enregistrer cette carte pour mes prochains achats
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-6">
              <Shield className="h-4 w-4 mr-1" />
              <span>Paiement sécurisé via Stripe</span>
            </div>
          </>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={
            !stripe || isProcessing || (!savedMethodId && !cardComplete)
          }
          className={`w-full flex items-center justify-center py-3 px-4 rounded-md text-white font-medium transition-colors ${
            !stripe || isProcessing || (!savedMethodId && !cardComplete)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Traitement en cours...
            </>
          ) : (
            <>
              Payer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreditCardForm;

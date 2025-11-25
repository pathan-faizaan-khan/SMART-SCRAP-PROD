"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Terms and Conditions Data
const TERMS_DATA = {
  termsAndConditions: {
    title: "Terms and Conditions",
    color: "text-blue-600 dark:text-blue-400",
    sections: [
      {
        title: "1. Acceptance of Terms",
        content: "By creating an account with ExamSim, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions."
      },
      {
        title: "2. Use of Service",
        content: "Our platform provides exam simulation and preparation tools. You agree to use these services only for legitimate educational purposes."
      },
      {
        title: "3. Account Responsibility",
        content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
      },
      {
        title: "4. Prohibited Activities",
        content: "You may not:",
        list: [
          "Share exam content or questions outside the platform",
          "Use automated tools to access or manipulate the service",
          "Attempt to gain unauthorized access to other users' accounts",
          "Use the service for any illegal or unauthorized purpose"
        ]
      },
      {
        title: "5. Intellectual Property",
        content: "All exam content, questions, and materials are the intellectual property of ExamSim and are protected by copyright laws."
      },
      {
        title: "6. Service Availability",
        content: "We strive to maintain 99.9% uptime but do not guarantee uninterrupted access to our services."
      },
      {
        title: "7. Limitation of Liability",
        content: "ExamSim shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service."
      }
    ]
  },
  privacyPolicy: {
    title: "Privacy Policy",
    color: "text-green-600 dark:text-green-400",
    sections: [
      {
        title: "1. Information We Collect",
        content: "We collect information you provide directly (name, email, college, phone number) and usage data (exam scores, study time, performance metrics)."
      },
      {
        title: "2. How We Use Your Information",
        content: "We use your information to:",
        list: [
          "Provide and improve our educational services",
          "Track your progress and generate performance reports",
          "Send important updates about your account and exams",
          "Customize your learning experience"
        ]
      },
      {
        title: "3. Information Sharing",
        content: "We do not sell, trade, or rent your personal information to third parties. We may share aggregated, anonymized data for research purposes."
      },
      {
        title: "4. Data Security",
        content: "We implement industry-standard security measures to protect your personal information, including encryption and secure data storage."
      },
      {
        title: "5. Cookies and Tracking",
        content: "We use cookies to enhance your experience and analyze usage patterns. You can disable cookies in your browser settings."
      },
      {
        title: "6. Data Retention",
        content: "We retain your account information for as long as your account is active or as needed to provide services."
      },
      {
        title: "7. Your Rights",
        content: "You have the right to access, update, or delete your personal information. Contact us at privacy@examsim.com for assistance."
      },
      {
        title: "8. Third-Party Services",
        content: "Our service may contain links to third-party websites. We are not responsible for their privacy practices."
      },
      {
        title: "9. Updates to Privacy Policy",
        content: "We may update this policy periodically. Continued use of our service constitutes acceptance of any changes."
      }
    ]
  },
  refundPolicy: {
    title: "Refund Policy",
    color: "text-orange-600 dark:text-orange-400",
    sections: [
      {
        title: "1. Refund Eligibility",
        content: "Refunds are available under the following conditions:",
        list: [
          "Request made within 7 days of purchase",
          "Technical issues preventing access to purchased content",
          "Duplicate purchases made in error",
          "Service not delivered as promised"
        ]
      },
      {
        title: "2. Non-Refundable Items",
        content: "The following purchases are non-refundable:",
        list: [
          "Completed exam attempts (results already generated)",
          "Downloaded study materials",
          "Services used for more than 7 days",
          "Promotional or discounted purchases"
        ]
      },
      {
        title: "3. Refund Process",
        content: "To request a refund:",
        list: [
          "Contact our support team at support@examsim.com",
          "Provide your order ID and reason for refund",
          "Allow 5-10 business days for processing",
          "Refunds will be processed to the original payment method"
        ]
      },
      {
        title: "4. Partial Refunds",
        content: "Partial refunds may be offered for services partially used, calculated on a pro-rata basis based on usage."
      },
      {
        title: "5. Cancellation Policy",
        content: "You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period."
      },
      {
        title: "6. Disputed Charges",
        content: "If you notice any unauthorized charges, please contact us immediately. We will investigate and resolve the issue promptly."
      },
      {
        title: "7. Refund Timeline",
        content: "Approved refunds will be processed within 5-10 business days. Bank processing times may vary and can take up to 2 additional business days."
      }
    ]
  },
  contactInfo: {
    title: "Contact Information",
    content: "If you have any questions about these Terms and Conditions, Privacy Policy, or Refund Policy, please contact us at:",
    details: [
      "Email: support@examsim.com",
      "Address: Henceprove Education PVT LTD, Hyderabad, India"
    ]
  }
};

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export function TermsDialog({ open, onOpenChange, onAccept }: TermsDialogProps) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptRefund, setAcceptRefund] = useState(false);

  const allAccepted = acceptTerms && acceptPrivacy && acceptRefund;

  // Redirect handlers for policy pages
  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('/terms', '_blank', 'noopener,noreferrer');
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('/privacy', '_blank', 'noopener,noreferrer');
  };

  const handleRefundClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('/refund', '_blank', 'noopener,noreferrer');
  };

  const handleAccept = () => {
    if (!allAccepted) {
      // If not all accepted, accept all and close dialog
      setAcceptTerms(true);
      setAcceptPrivacy(true);
      setAcceptRefund(true);
      onAccept();
      onOpenChange(false);
      setAcceptTerms(false);
      setAcceptPrivacy(false);
      setAcceptRefund(false);
    } else {
      // If all accepted, proceed with registration
      onAccept();
      onOpenChange(false);
      // Reset checkboxes for next time
      setAcceptTerms(false);
      setAcceptPrivacy(false);
      setAcceptRefund(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset checkboxes
    setAcceptTerms(false);
    setAcceptPrivacy(false);
    setAcceptRefund(false);
  };

  const renderSection = (sectionData: any) => (
    <div key={sectionData.title}>
      <h3 className={`font-semibold text-base sm:text-lg mb-3 ${sectionData.color}`}>
        {sectionData.title}
      </h3>
      <div className="space-y-3">
        {sectionData.sections.map((section: any, index: number) => (
          <div key={index}>
            <p className="text-xs sm:text-sm">
              <strong>{section.title}:</strong> {section.content}
            </p>
            {section.list && (
              <ul className="list-disc ml-4 sm:ml-6 space-y-1 mt-2 text-xs sm:text-sm">
                {section.list.map((item: string, itemIndex: number) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[95vw] sm:max-w-4xl w-full h-[95vh] sm:h-[90vh] bg-white dark:bg-gray-800 flex flex-col mx-2 sm:mx-auto">
        <AlertDialogHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-600 pb-3 sm:pb-4 px-4 sm:px-6">
          <AlertDialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
            Terms, Privacy & Refund Policy
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Please read and accept our policies to continue with registration.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden px-4 sm:px-6">
          <ScrollArea className="h-full pr-2 sm:pr-4">
            <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm text-gray-900 dark:text-gray-100 py-3 sm:py-4">
              {/* Terms and Conditions Section */}
              {renderSection(TERMS_DATA.termsAndConditions)}

              <Separator className="my-4 sm:my-6" />

              {/* Privacy Policy Section */}
              {renderSection(TERMS_DATA.privacyPolicy)}

              <Separator className="my-4 sm:my-6" />

              {/* Refund Policy Section */}
              {renderSection(TERMS_DATA.refundPolicy)}

              <Separator className="my-4 sm:my-6" />

              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">{TERMS_DATA.contactInfo.title}</h4>
                <p className="text-xs sm:text-sm mb-2">{TERMS_DATA.contactInfo.content}</p>
                <ul className="text-xs sm:text-sm space-y-1">
                  {TERMS_DATA.contactInfo.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Bottom Section */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-600 pt-3 sm:pt-4 bg-white dark:bg-gray-800 px-4 sm:px-6">
          {/* Individual Checkboxes */}
          <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2 sm:space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <Checkbox
                id="accept-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="accept-terms" className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer flex-1 leading-relaxed">
                I have read and agree to the{" "}
                <span 
                  className="text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
                  onClick={handleTermsClick}
                >
                  Terms and Conditions
                </span>
              </label>
            </div>
            
            {/* Privacy Policy */}
            <div className="flex items-start space-x-2 sm:space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <Checkbox
                id="accept-privacy"
                checked={acceptPrivacy}
                onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="accept-privacy" className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer flex-1 leading-relaxed">
                I have read and agree to the{" "}
                <span 
                  className="text-green-600 dark:text-green-400 underline cursor-pointer hover:text-green-800 dark:hover:text-green-300"
                  onClick={handlePrivacyClick}
                >
                  Privacy Policy
                </span>
              </label>
            </div>

            {/* Refund Policy */}
            <div className="flex items-start space-x-2 sm:space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <Checkbox
                id="accept-refund"
                checked={acceptRefund}
                onCheckedChange={(checked) => setAcceptRefund(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="accept-refund" className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer flex-1 leading-relaxed">
                I have read and agree to the{" "}
                <span 
                  className="text-orange-600 dark:text-orange-400 underline cursor-pointer hover:text-orange-800 dark:hover:text-orange-300"
                  onClick={handleRefundClick}
                >
                  Refund Policy
                </span>
              </label>
            </div>
          </div>

          <AlertDialogFooter className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-600 gap-2 sm:gap-3">
            <AlertDialogCancel 
              onClick={handleCancel} 
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccept}
              className={`transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4 py-2 ${
                allAccepted
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              }`}
            >
              {allAccepted ? "Accept and Continue" : "Accept All Policies"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
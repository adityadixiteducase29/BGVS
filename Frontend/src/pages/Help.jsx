import React from 'react'
import {
  Typography,
  Box,
  Paper,
  CardContent,
  CardHeader,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { ExpandMore, Help, Support, Book, VideoLibrary } from '@mui/icons-material'
import './VerifierHelp/index.css'

const VerifierHelp = () => {
  const helpSections = [
    {
      title: "Getting Started",
      icon: <Help />,
      content: "Learn the basics of document verification and how to use the verifier dashboard effectively.",
      items: [
        "Understanding the verification process",
        "Navigating the dashboard",
        "Setting up your profile",
        "Understanding priority levels"
      ]
    },
    {
      title: "Verification Guidelines",
      icon: <Book />,
      content: "Comprehensive guidelines for verifying different types of documents and handling edge cases.",
      items: [
        "Aadhar Card verification standards",
        "PAN Card verification process",
        "Passport verification requirements",
        "Common verification errors to avoid"
      ]
    },
    {
      title: "Video Tutorials",
      icon: <VideoLibrary />,
      content: "Step-by-step video guides for various verification processes and dashboard features.",
      items: [
        "Document verification walkthrough",
        "Dashboard navigation tutorial",
        "Priority management guide",
        "Reporting and analytics overview"
      ]
    },
    {
      title: "Support & Contact",
      icon: <Support />,
      content: "Get in touch with our support team for technical issues or verification-related questions.",
      items: [
        "Technical support contact",
        "Verification process questions",
        "Dashboard feature requests",
        "Emergency contact information"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="dashboard-title" style={{color:"#4F378B"}}>
          Help & Support
        </h1>
        <p className="text-gray-600">Find answers to common questions and get support for verification tasks</p>
      </div>
      
      {/* Quick Help Cards */}
      <div className="help-cards-container">
        {helpSections.map((section, index) => (
          <Paper key={index} elevation={1} className="help-card">
            <CardHeader
              avatar={section.icon}
              title={section.title}
              className="help-card-header"
            />
            <CardContent className="help-card-content">
              <Typography variant="body2" color="text.secondary" className="help-card-description">
                {section.content}
              </Typography>
              <ul className="help-card-list">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="help-card-list-item">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Paper>
        ))}
      </div>
      
      {/* FAQ Section */}
      <div className="faq-section">
        <Typography variant="h5" className="faq-title">
          Frequently Asked Questions
        </Typography>
        
        <Accordion className="faq-accordion">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">How do I handle high-priority applications?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              High-priority applications should be reviewed within 2 hours of submission. 
              These are typically marked with red priority indicators and require immediate attention.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion className="faq-accordion">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">What should I do if I encounter a suspicious document?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              If you encounter a suspicious document, mark it as "Rejected" and add detailed notes 
              explaining your concerns. Contact your supervisor immediately for further guidance.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion className="faq-accordion">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">How can I improve my verification speed?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Focus on one application at a time, use keyboard shortcuts, and familiarize yourself 
              with common document patterns. Regular practice and following verification guidelines 
              will naturally improve your speed.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
      
      {/* Contact Support */}
      <div className="contact-support-section">
        <Paper elevation={1} className="contact-support-card">
          <CardHeader
            title="Need More Help?"
            subheader="Our support team is available 24/7 to assist you"
            className="contact-support-header"
          />
          <CardContent className="contact-support-content">
            <Typography variant="body1" className="contact-support-text">
              If you couldn't find the answer you're looking for, don't hesitate to contact our support team.
            </Typography>
            <div className="contact-support-buttons">
              <button className="contact-button primary">
                Contact Support
              </button>
              <button className="contact-button secondary">
                Schedule Training
              </button>
            </div>
          </CardContent>
        </Paper>
      </div>
    </div>
  );
};

export default VerifierHelp;

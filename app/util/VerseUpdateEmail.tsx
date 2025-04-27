import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

export const VerseUpdateEmail = ({
  date = "2025-04-27",
  citation = "John 3:16",
  passage = "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
}) => (
  <Html>
    <Head />
    <Preview>Verse of the Day Updated: {date}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Verse of the Day Updated Successfully!</Heading>
        <Text style={paragraph}>Date: {date}</Text>
        <Text style={paragraph}>Citation: {citation}</Text>
        <Text style={paragraph}>Passage: {passage}</Text>
        <Text style={paragraph}>
The verse for {date} has been successfully fetched and stored in the database.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default VerseUpdateEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
  textAlign: 'center' as const,
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 20px',
}; 
import * as React from 'react';
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

const EnquiryConfirmation = ({ name = "John", message = "I'm interested in learning more about your services and would like to schedule a consultation." }) => {
  return (
    <Html>
      <Head />
      <Preview>感謝您的查詢 - {name}</Preview>
      <Tailwind>
        <Body className="bg-[#f0f4f1] font-sans py-[40px]">
          <Container className="bg-white rounded-[16px] mx-auto p-[28px] max-w-[600px] border border-[#e0e8e2]">
            <Section>
              <Heading className="text-[26px] font-bold text-[#2c5e43] my-[16px]">
                感謝您的查詢 - {name}
              </Heading>
              <Text className="text-[16px] text-[#5a6b5e] mb-[24px]">
                我們已收到您的查詢，並會盡快回覆。
              </Text>
              <Hr className="border-[#d5e2d8] my-[24px]" />
              <Text className="text-[16px] text-[#5a6b5e] mb-[12px]">
                以下是您的查詢摘要：
              </Text>
              <Section className="bg-[#e8f2ec] rounded-[16px] p-[20px] mb-[24px] border-l-[4px] border-[#7ab893]">
                <Text className="text-[14px] text-[#4a5c50] m-0">
                  <strong>提交日期:</strong> {new Date().toLocaleDateString()}
                </Text>
                <Text className="text-[14px] text-[#4a5c50] m-0 mt-[8px]">
                  <strong>您的查詢:</strong>
                </Text>
                <Text className="text-[14px] text-[#4a5c50] italic bg-white p-[12px] rounded-[8px] mt-[8px] border border-[#d5e2d8]">
                  "{message}"
                </Text>
              </Section>
              <Text className="text-[16px] text-[#5a6b5e] mb-[24px]">
                我們正在審閱您的查詢，並會在1-2個工作天內回覆。如有任何緊急問題，請直接聯絡我們。
              </Text>
              <Section className="text-center mb-[28px]">
                <Button
                  className="bg-[#5a9a7a] text-white rounded-[24px] py-[12px] px-[28px] text-[16px] font-medium no-underline box-border shadow-sm hover:bg-[#4d8768]"
                  href="https://example.com/contact"
                >
                  聯絡我們
                </Button>
              </Section>
              <Section className="bg-[#e7f0f7] rounded-[16px] p-[20px] mb-[24px] border border-[#d0e1f0]">
                <Text className="text-[15px] text-[#4b6584] m-0">
                  "我們承諾在所有我們所做的事情中，都堅持可持續發展和環境責任。"
                </Text>
              </Section>
              <Hr className="border-[#d5e2d8] my-[24px]" />
              <Text className="text-[14px] text-[#7d8c82]">
                如果您沒有提交此查詢，請忽略此電子郵件或聯絡我們的支援團隊。
              </Text>
            </Section>
            <Section className="mt-[32px] bg-[#f5f8f6] rounded-[16px] p-[20px]">
              <Row>
                <Column>
                  <Text className="text-[12px] text-[#7d8c82] text-center m-0">
                    © {new Date().getFullYear()} 屯門前鋒會及幼鋒會. 保留所有權利。
                  </Text>
                  <Text className="text-[12px] text-[#7d8c82] text-center m-0">
                  屯門山景邨景榮樓21-30號地下<br />
                  山景綜合青少年服務中心
                  </Text>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

EnquiryConfirmation.PreviewProps = {
  name: "Sarah",
  enquiryContent: "I'm interested in your eco-friendly products and would like to know more about your sustainability practices. Do you offer bulk ordering options for businesses?"
};

export default EnquiryConfirmation;
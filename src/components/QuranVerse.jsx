import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const QuranVerseContainer = styled.div`
  background: #f8f5f0;
  border-radius: 12px;
  padding: 2rem;
  margin: rem;
  margin-top:4rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  width: 100%;
  height:"10px"
  direction: rtl;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ArabicText = styled.div`
  font-family: 'Amiri', serif;
  font-size: 2rem;
  line-height: 4rem;
  color: #2d2d2d;
  margin-bottom: 1.5rem;
`;

const Reference = styled.div`
  font-family: 'Amiri', serif;
  font-size: 1.5rem;
  color: #777;
  text-align: center;
  margin-top: 1rem;
  border-top: 1px solid #e0d7cd;
  padding-top: 1rem;
`;

const Decoration = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  color: #2a9d8f;

  svg {
    width: 40px;
    height: 40px;
  }
`;

const QuranVerse = ({ arabicText, reference }) => {
  return (
    <QuranVerseContainer>
      <Decoration>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </Decoration>
      <ArabicText>{arabicText}</ArabicText>
      <Reference>{reference}</Reference>
    </QuranVerseContainer>
  );
};

QuranVerse.propTypes = {
  arabicText: PropTypes.string.isRequired,
  reference: PropTypes.string.isRequired
};

export default QuranVerse;
// src/components/reports/withScrollAnimation.jsx
import React from 'react';
import ScrollAnimation from '../common/ScrollAnimation';

const withScrollAnimation = (Component, options = {}) => {
  return (props) => (
    <ScrollAnimation
      animation={options.animation || "fadeIn"}
      delay={options.delay || 0}
      duration={options.duration || 0.5}
      {...options}
    >
      <Component {...props} />
    </ScrollAnimation>
  );
};

export default withScrollAnimation;
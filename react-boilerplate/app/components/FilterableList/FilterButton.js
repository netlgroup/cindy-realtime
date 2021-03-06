import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { ButtonTransparent } from 'rebass';

import messages from './messages';

const StyledButton = styled(ButtonTransparent)`
  border-radius: 10px;
  padding: 10px 5px;
  margin: 0;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const IndexSpan = styled.span`
  border-radius: 9999px;
  background-color: #b58900;
  color: #fcf4dc;
  padding: 2px;
  margin: 0 3px;
`;

function FilterButton(props) {
  const { name, index, asc } = props;
  const namestr = messages[name] ? (
    <FormattedMessage {...messages[name]} />
  ) : (
    name
  );

  return (
    <div>
      <StyledButton
        onClick={() => props.onMainButtonClick(name)}
        color="gray"
        bg="white"
      >
        {index !== undefined &&
          index !== null && <IndexSpan>{index + 1}</IndexSpan>}
        {namestr}
      </StyledButton>
      {props.asc !== null &&
        props.asc !== undefined && (
          <StyledButton
            onClick={() => props.onSortButtonClick(name)}
            color="gray"
            bg="white"
          >
            {asc === true ? '↓' : '↑'}
          </StyledButton>
        )}
    </div>
  );
}

FilterButton.propTypes = {
  name: PropTypes.string.isRequired,
  index: PropTypes.number,
  asc: PropTypes.bool,
  onMainButtonClick: PropTypes.func.isRequired,
  onSortButtonClick: PropTypes.func.isRequired,
};

export default FilterButton;

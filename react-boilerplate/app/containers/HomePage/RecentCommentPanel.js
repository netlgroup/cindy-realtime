import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { easing, tween } from 'popmotion';
import { from_global_id as f, withLocale } from 'common';
import { FormattedMessage } from 'react-intl';
import posed from 'react-pose';

import { Flex, Box } from 'rebass';
import { ImgSm as Img, RouterLink } from 'style-store';
import chevronLeft from 'images/chevron-yellowgreen-left.svg';
import chevronRight from 'images/chevron-yellowgreen-right.svg';
import UserLabel from 'components/UserLabel';
import TitleLabel from 'components/TitleLabel';

import messages from './messages';

const CommentContent = posed.div({
  on: {
    left: 0,
    transition: (props) =>
      tween({
        ...props,
        duration: 300,
        ease: easing.anticipate,
      }),
  },
  off: {
    left: 'calc(100% - 6.8em)',
    transition: (props) =>
      tween({
        ...props,
        duration: 300,
        ease: easing.easeInOut,
      }),
  },
  initialPose: 'off',
});

class RecentCommentPanel extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      on: false,
    };
  }
  render() {
    const { node } = this.props;
    return (
      <Box
        m={2}
        bg="blanchedalmond"
        style={{ overflow: 'hidden', position: 'relative' }}
      >
        <Box
          w="calc(100% - 6.8em)"
          p={2}
          color="darksoil"
          style={{ position: 'absolute', zIndex: 20 }}
        >
          <FormattedMessage
            {...messages.commentHint}
            values={{
              user: <UserLabel user={node.user} />,
              puzzle_user: <UserLabel user={node.puzzle.user} />,
              puzzle_title: (
                <RouterLink
                  to={withLocale(`/puzzle/show/${f(node.puzzle.id)[1]}`)}
                  style={{ color: 'sienna', fontWeight: 'bold' }}
                >
                  {node.puzzle.title}
                </RouterLink>
              ),
            }}
          />
        </Box>
        <CommentContent
          pose={this.state.on ? 'on' : 'off'}
          style={{
            position: 'relative',
            display: 'flex',
            zIndex: 30,
          }}
        >
          <button
            style={{
              display: 'inline-block',
              float: 'right',
              marginLeft: '20px',
            }}
            onClick={() => this.setState(({ on }) => ({ on: !on }))}
          >
            {this.state.on ? (
              <Img alt="detail" src={chevronRight} />
            ) : (
              <Img alt="detail" src={chevronLeft} />
            )}
          </button>
          <Box w={1} bg="yellowgreen" p={2} color="blanchedalmond">
            {node.content}
            <div style={{ float: 'right' }}>
              ——<UserLabel user={node.user} color="blanchedalmond" />
            </div>
          </Box>
        </CommentContent>
      </Box>
    );
  }
}

export default RecentCommentPanel;

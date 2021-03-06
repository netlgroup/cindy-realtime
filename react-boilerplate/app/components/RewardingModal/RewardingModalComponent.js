import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { text2md, from_global_id as f, withLocale } from 'common';
import { Link } from 'react-router-dom';
import { FormattedMessage, intlShape } from 'react-intl';
import { Flex, Box } from 'rebass';
import {
  Splitter,
  PuzzleFrame,
  ButtonOutline,
  DarkNicknameLink as NicknameLink,
} from 'style-store';
import genreMessages from 'components/TitleLabel/messages';
import { genreInfo, yamiInfo } from 'components/TitleLabel/constants';
import UserAwardPopover from 'components/UserAwardPopover';

import CommentShowPanel from './CommentShowPanel';
import messages from './messages';

const Title = styled.h2`
  font-size: 1.4em;
  text-align: center;
`;

const Frame = styled(PuzzleFrame)`
  margin: 5px 0;
  overflow: auto;
`;

const JumpButton = styled(ButtonOutline)`
  background-color: rgba(255, 255, 255, 0.5);
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    color: #4297e9;
  }
`;

const CloseButton = styled(ButtonOutline)`
  background-color: rgba(255, 255, 255, 0.5);
  color: #aa6644;
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    color: #b58900;
  }
`;

const PuzzleUserLabel = styled(NicknameLink)`
  padding: 5px;
  font-size: 1.1em;
  color: #033393;
`;

function RewardingModalComponent(props, context) {
  const _ = context.intl.formatMessage;
  const genre = _(genreMessages[genreInfo[props.puzzle.genre].name]);
  const yami = props.puzzle.yami
    ? ` x ${_(genreMessages[yamiInfo[props.puzzle.yami].name])}`
    : '';
  return (
    <div>
      {props.showContent ? (
        <Frame>
          <Title>{`[${genre}${yami}] ${props.puzzle.title}`}</Title>
          <Splitter />
          <div
            dangerouslySetInnerHTML={{
              __html: text2md(props.puzzle.content, props.puzzle.contentSafe),
            }}
          />
          <div style={{ textAlign: 'right' }}>
            {'——'}
            <PuzzleUserLabel
              to={withLocale(`/profile/show/${props.puzzle.user.rowid}`)}
            >
              {props.puzzle.user.nickname}
            </PuzzleUserLabel>
            <UserAwardPopover
              style={{ color: '#033393' }}
              userAward={props.puzzle.user.currentAward}
            />
          </div>
        </Frame>
      ) : (
        <Frame>
          <Title>{`[${genre}${yami}] ${props.puzzle.title}`}</Title>
        </Frame>
      )}
      {props.puzzle.commentSet.edges.map((edge) => (
        <Frame key={edge.node.id}>
          <CommentShowPanel node={edge.node} />
        </Frame>
      ))}
      {props.onHide && (
        <Flex flexWrap="wrap">
          <Box w={2 / 3}>
            <Link to={withLocale(`/puzzle/show/${f(props.puzzle.id)[1]}`)}>
              <JumpButton p={2} style={{ borderRadius: '10px 0 0 10px' }} w={1}>
                <FormattedMessage {...messages.jump} />
              </JumpButton>
            </Link>
          </Box>
          <Box w={1 / 3}>
            <CloseButton
              onClick={props.onHide}
              p={2}
              borderRadius="0 10px 10px 0"
              border="2px solid #aa6644"
              w={1}
            >
              <FormattedMessage {...messages.close} />
            </CloseButton>
          </Box>
        </Flex>
      )}
      {!props.onHide && (
        <Link to={withLocale(`/puzzle/show/${f(props.puzzle.id)[1]}`)}>
          <JumpButton p={2} w={1}>
            <FormattedMessage {...messages.jump} />
          </JumpButton>
        </Link>
      )}
    </div>
  );
}

RewardingModalComponent.contextTypes = {
  intl: intlShape,
};

RewardingModalComponent.propTypes = {
  puzzle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    genre: PropTypes.number.isRequired,
    yami: PropTypes.number.isRequired,
    user: PropTypes.object.isRequired,
    content: PropTypes.string.isRequired,
    contentSafe: PropTypes.bool.isRequired,
    commentSet: PropTypes.shape({
      edges: PropTypes.array.isRequired,
    }),
  }),
  onHide: PropTypes.func,
  showContent: PropTypes.bool,
};

RewardingModalComponent.defaultProps = {
  showContent: true,
};

export default RewardingModalComponent;

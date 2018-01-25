/**
 *
 * PuzzleList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import { createPaginationContainer, graphql } from 'react-relay';
import { ButtonOutline } from 'style-store';

import injectSaga from 'utils/injectSaga';
import PuzzlePanel from 'components/PuzzlePanel';
import PuzzleListInitQuery from 'graphql/PuzzleListInitQuery';
import chatMessages from 'containers/Chat/messages';

import makeSelectPuzzleList from './selectors';
import saga from './saga';

const StyledButtonOutline = ButtonOutline.extend`
  border-radius: 10px;
  padding: 10px 0;
`;

export class PuzzleList extends React.Component {
  constructor(props) {
    super(props);
    this.loadMore = this.loadMore.bind(this);
  }

  loadMore() {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return;
    }

    this.props.relay.loadMore(10, (error) => {
      console.log(error);
    });
  }

  render() {
    return (
      <div>
        {this.props.list.allPuzzles.edges.map((edge) => (
          <PuzzlePanel node={edge.node} key={edge.node.id} />
        ))}
        {this.props.relay.hasMore() ? (
          <StyledButtonOutline onClick={this.loadMore} w={1}>
            <FormattedMessage {...chatMessages.loadMore} />
          </StyledButtonOutline>
        ) : (
          ''
        )}
      </div>
    );
  }
}

PuzzleList.propTypes = {
  relay: PropTypes.object.isRequired,
  list: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  puzzlelist: makeSelectPuzzleList(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withSaga = injectSaga({ key: 'puzzleList', saga });

const withPuzzleList = (Component) =>
  createPaginationContainer(
    Component,
    {
      list: graphql`
        fragment PuzzleList_list on Query
          @argumentDefinitions(
            count: { type: Int, defaultValue: 3 }
            cursor: { type: String }
            orderBy: { type: "[String]", defaultValue: "-id" }
            status: { type: Float, defaultValue: null }
            status__gt: { type: Float, defaultValue: null }
          ) {
          allPuzzles(
            first: $count
            after: $cursor
            orderBy: $orderBy
            status: $status
            status_Gt: $status__gt
          ) @connection(key: "PuzzleNode_allPuzzles") {
            edges {
              node {
                id
                ...PuzzlePanel_node
              }
            }
          }
        }
      `,
    },
    {
      direction: 'forward',
      getConnectionFromProps(props) {
        return props.list && props.list.allPuzzles;
      },
      getFragmentVariables(prevVars, totalCount) {
        return {
          ...prevVars,
          count: totalCount,
        };
      },
      getVariables(props, { count, cursor }, fragmentVariables) {
        return {
          count,
          cursor,
          orderBy: fragmentVariables.orderBy,
          status: fragmentVariables.status,
          status__gt: fragmentVariables.status__gt,
        };
      },
      query: PuzzleListInitQuery,
    }
  );

export default compose(withSaga, withConnect, withPuzzleList)(PuzzleList);

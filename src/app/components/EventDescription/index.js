import React, { useState, useEffect } from 'react'

import { compose } from 'react-apollo'
import { gql } from 'apollo-boost'

// Styles
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

// Core
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import withApolloQuery from 'app/hocs/withApolloQuery'
import withApolloMutation from 'app/hocs/withApolloMutation'
import withLoading from 'app/hocs/withLoading'
import withMutationProgress from 'app/hocs/withMutationProgress'

import AutoSaveTextField from 'app/components/AutoSaveTextField'

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
  },
}))

export const EventDescription = ({
  event,
  eventEdit,
  id,
  updating,
  ...otherProps
}) => {

  const classes = useStyles()

  const isset = fn => {
      var value;
      try {
          value = fn();
      } catch (e) {
          value = undefined;
      } finally {
          return value !== undefined;
      }
  }

  return (
    <Grid container spacing={3} direction="column">
      <Grid item xs={12} md={6}>
        <Paper className={classes.paper}>
          <AutoSaveTextField
            label="Title"
            value={event.title}
            updating={isset(() => updating.title) }
            onChange={ev=>eventEdit({ id, title: ev.target.value })}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper className={classes.paper}>
          <AutoSaveTextField
            label="Sub Title"
            value={event.subtitle}
            updating={isset(() => updating.event.subtitle) }
            onChange={ev=>eventEdit({ id, subtitle: ev.target.value })}
          />
        </Paper>
      </Grid>
    </Grid>
  )
}

///////////////////////////////////////////////

const eventsQuery = gql`
  query eventsQuery($id: Int) {
    events(id: $id) {
      id
      title
      subtitle
    }
  }
`

const eventEditMutation = gql`
  mutation eventEdit($event: EventInput!) {
    eventEdit(Event:$event) {
      id
      title
      subtitle
    }
  }
`

const eventsQueryOptions = {
  QueryProps: {
    query: eventsQuery
  },
  mapResultToProps: ({
    loading,
    error,
    data: {
      events: [ event ] = []
    } = {}
  }) => ({ loading, error, event }),
  mapPropsToVariables: ({ id }) => ({ id })
}

const eventEditMutationOptions = {
  MutationProps: {
    mutation: eventEditMutation
  },
  mapMutateToProps: mutate => ({
    eventEdit: event => mutate({variables: { event }})
  }),
  mapResultToProps: ({ called, loading, error, data: { eventEdit: event = {} } = {} }, props) => {
    return {
      ...props,
      ...(called && !loading && !error && { event } || {})
    }
  }
}

export default compose(
  withApolloQuery(eventsQueryOptions),
  withApolloMutation(eventEditMutationOptions),
  withLoading(()=><div>Loading...</div>),
  withMutationProgress({ propName: 'eventEdit', fakeLatencyMs: 0 }),
)(EventDescription)

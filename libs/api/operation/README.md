# api-operation

Unit involvement flow:

1. A unit is added as pending Unit
2. The unit sets an operational status (3/4) and its pending state changes to an involvement state, that is where an involvement time is added. The time is not the time of the pending state but of the involvement (status given time)
3. A unit gets released from an operation, the involvement will end, or if in pending, the unit will be completely removed if it has no other involvement times in this operation

For ongoing operations the flow is rather simple, a list of new involvements is given and checked against the current involvements. If a new involvement is not in the current involvements, it is added as a pending involvement. If an involvement is not in the new involvements, it is ended or removed if not involved before (see step 3 above).
For completed operations changes will result in completely removing involvements of the operation and setting it newly by checking each involvement for other involvements. If involved somewhere else at the time, an error will be thrown, unlike for ongoing operations!

## Running unit tests

Run `nx test api-operation` to execute the unit tests via
[Jest](https://jestjs.io).

parser grammar OracleAntlrParser;

options {
    tokenVocab = OracleAntlrLexer;
}

expressionInputFile: fullExpression ;

conditionInputFile: fullExpression ;

hintInputFile: hintsList ;

dynamicSqlInputFile: (sqlStatement | plSqlStatement) ;

computedColumnExpressionInputFile: computedColumnExpression ;

expressionListInputFile: fullExpressionList ;

hintsList: hintItem* ;

hintItem:
    (
        FIRST_ROWS
        | INDEX
        | FULL
        | HASH
        | MERGE
        | PARALLEL
        | CACHE
        | NOCACHE
        | simpleIdentifier
    )
    hintParams?;

hintParams:
    LPAREN queryBlock? (literal | identifier | complexIndexHint)* RPAREN;

complexIndexHint: LPAREN identifier* RPAREN;

queryBlock: AT_SIGN identifier;

sqlInputFile: sqlStatementBatch (FSLASH  sqlStatementBatch)* ;
sqlStatementBatch: sqlStatement (SEMI sqlStatementBatch?)?;
sqlStatement:
    createStatement
    | alterStatement
    | dropStatement
    |
    label?
    (
        deleteStatement
        | closeStatement
        | openStatement
        | executeImmediateStatement
        | setTransactionStatement
        | raiseStatement
        | truncateTableStatement
        | truncateClusterStatement
        | blockStatement
        | selectStatement
        | insertStatement
        | updateStatement
        | gotoStatement
        | fetchStatement
        | commitWorkStatement
        | rollbackWorkStatement
        | savepointStatement
        | mergeStatement
    );

plSqlStatementBatch: ({IsSqlStatement()}? plSqlStatement)*;

plSqlStatement:
    label?
    (
        controlStructure
        | continueStatement
        | deleteStatement
        | executeImmediateStatement
        | assignmentStatement
        | raiseStatement
        | commitWorkStatement
        | exitStatement
        | procedureCall
        | closeStatement
        | openStatement
        | setTransactionStatement
        | declarationPragma
        | blockStatement
        | selectStatement
        | insertStatement
        | updateStatement
        | gotoStatement
        | fetchStatement
        | rollbackWorkStatement
        | savepointStatement
        | returnStatement
        | nullStatement
        | lockTableStatement
        | mergeStatement
        | pipeRowStatement
    )
    SEMI;

routineSignature:
    CREATE
    createStatementReplaceClause?
    editionOptionClause?
    procedureOrFunctionSignature
    .*?
    ;

procedureOrFunctionSignature:
    procedureSignature
    | functionSignature;

literal:
    numberLiteral =
    (
        INTEGER_LITERAL
        | FLOATING_POINT_LITERAL
        | MONEY_LITERAL
    )
    | characterStringLiteral
    | quoteCharacterStringLiteral
    | unicodeCharacterStringLiteral
    | binaryStringLiteral
    | booleanLiteral
    | dateLiteral
    | timestampLiteral
    | intervalLiteral
    | floatingPointBinaryLiteral;

quoteCharacterStringLiteral: QUOTE_CHARACTER_STRING_LITERAL;

characterStringLiteral: CHARACTER_STRING_LITERAL;

unicodeCharacterStringLiteral: UNICODE_CHARACTER_STRING_LITERAL;

binaryStringLiteral: BINARY_STRING_LITERAL;

booleanLiteral: TRUE | FALSE;

dateLiteral: DATE CHARACTER_STRING_LITERAL;

timestampLiteral: TIMESTAMP CHARACTER_STRING_LITERAL;

intervalLiteral:
    INTERVAL CHARACTER_STRING_LITERAL intervalLiteralFieldClause (TO intervalLiteralFieldClause)?;

intervalLiteralFieldClause:
    interval = (YEAR | MONTH | DAY | HOUR | MINUTE | SECOND) intervalLiteralFieldPrecision?;
intervalLiteralFieldPrecision:
    LPAREN literal (COMMA literal)? RPAREN;

floatingPointBinaryLiteral: FLOATING_POINT_BINARY_LITERAL;

/*
  Lexer will just match tokens, it cannot put any meanings into them. Parser will process input
  tokens and give them meaning. All PL/SQL keywords are defined as dedicated tokens, but some of them
  may also act as identifiers, rather than keywords. For example, you can have column named 'AT', so we
  need to make sure it is parsed as identifier, depending on the context. The biggest issue that is not
  currently addressed is that some keywords can be identifiers in one context, but not in the other.
  For example, you can have table column named 'IF', but you can't have local variable named 'IF'. Ideally
  we need to have below lists for all different contexts, but this is a significant change to the grammar.
*/
simpleIdentifierRegularIdentifier:
    REGULAR_IDENTIFIER
    |
    (
        AT
        | A_
        | ACCOUNT
        | ADVANCED
        | AFTER
        | AGENT
        | AGGREGATE
        | ALLOCATE
        | ALLOW
        | ALWAYS
        | ANALYZE
        | ANYSCHEMA
        | ARCHIVE
        | ARRAY
        | ASSOCIATE
        | ATTRIBUTE
        | ATTRIBUTES
        | AUTHENTICATION
        | AUTHID
        | AUTO
        | AUTONOMOUS_TRANSACTION
        | BASIC
        | BASICFILE
        | BATCH
        | BEFORE
        | BEGINNING
        | BINARY
        | BITMAP
        | BLOCK
        | BODY
        | BOTH
        | BREADTH
        | BUFFER_POOL
        | BUILD
        | BUILTIN
        | BULK
        | BULK_EXCEPTIONS
        | BULK_ROWCOUNT
        | BYTE
        | C_
        | CACHE
        | CALL
        | CASCADE
        | CAST
        | CELL_FLASH_CACHE
        | CHAR // Invalid user identifier, but STANDARD package has this declared as subtype without quotes
        | CHAR_CS
        | CHARACTER
        | CHARSET
        | CHR
        | CHUNK
        | CLOB
        | CLOSE
        | COALESCE
        | COLLATION
        | COLLECT
        | COLUMN_VALUE
        | COMMIT
        | COMMITTED
        | COMPACT
        | COMPILE
        | COMPLETE
        | COMPOUND
        | COMPUTATION
        | COMPUTE
        | CONDITIONAL
        | CONTAINER
        | CONTEXT
        | CONTINUE
        | CONSTANT
        | CONSTRAINT
        | CONSTRAINTS
        | CONSTRUCTOR
        | CONVERT
        | COUNT
        | CREATION
        | CROSS
        | CUBE
        | CURRENT_USER
        | CYCLE
        | DATA
        | DATABASE
        | DATAFILE
        | DATE
        | DAY
        | DBTIMEZONE
        | DDL
        | DEALLOCATE
        | DEBUG
        | DECODE
        | DECRYPT
        | DEDUPLICATE
        | DEFERRABLE
        | DEFERRED
        | DEFINER
        | DELETE
        | DEMAND
        | DENSE_RANK
        | DEPTH
        | DETERMINISTIC
        | DIRECT_LOAD
        | DISABLE
        | DISALLOW
        | DISASSOCIATE
        | DOUBLE
        | DUPLICATED
        | EACH
        | EDITION
        | EDITIONABLE
        | EDITIONING
        | EDITIONS
        | ELEMENT
        | ELSIF
        | EMPTY_KEYWORD
        | ENABLE
        | ENCRYPT
        | ENFORCED
        | ERROR
        | ERROR_CODE
        | ERROR_INDEX
        | ERRORS
        | ESCAPE
        | EVALUATE
        | EXCEPT
        | EXCEPTION_INIT
        | EXCEPTIONS
        | EXCLUDE
        | EXECUTE
        | EXISTS // Invalid user identifier, but it is the name of the method for collection data types, e.g. myCol.Exists(1)
        | EXIT
        | EXPIRE
        | EXTEND
        | EXTENDED
        | EXTENT
        | EXTERNALLY
        | EXTRACT
        | FALSE
        | FAST
        | FILESYSTEM_LIKE_LOGGING
        | FINAL
        | FIPSFLAG
        | FIRST
        | FIXED
        | FIRST_ROWS
        | FLASH_CACHE
        | FOLLOWING
        | FORALL
        | FORCE
        | FOREIGN
        | FORMAT
        | FOUND
        | FREELIST
        | FREELISTS
        | FREEPOOLS
        | FULL
        | FUNCTION
        | GENERATED
        | GLOBAL
        | GLOBALLY
        | GROUPING
        | GROUPS
        | HASH
        | HEAP
        | HIGH
        | HOUR
        | ID
        | IDENTIFIER
        | IDENTITY
        | INCLUDE
        | INCLUDING
        | INDEXING
        | INDICATOR
        | INDICES
        | INITIALLY
        | INITRANS
        | INNER
        | INSTANCE
        | INSTANTIABLE
        | INSTEAD
        | INTERFACE
        | INTERVAL
        | INVALIDATE
        | INVALIDATION
        | INVISIBLE
        | ISOLATION
        | ISOPEN
        | JAVA
        | JOIN
        | JSON
        | JSON_TABLE
        | KEEP
        | KEEP_DUPLICATES
        | KEY
        | LANGUAGE
        | LAST
        | LEADING
        | LEFT
        | LESS
        | LEVEL // Only allowed in special cases, like CONNECT BY (LEVEL > 10), where it is part of the expression
        | LEVELS
        | LIBRARY
        | LIKE2
        | LIKE4
        | LIKEC
        | LIMIT
        | LIST
        | LOB
        | LOBS
        | LOCAL
        | LOCATOR
        | LOCKED
        | LOCKING
        | LOG
        | LOGGING
        | LOGOFF
        | LOGON
        | LONG // Invalid user identifier, but STANDARD package has this declared as subtype without quotes
        | LOW
        | MAP
        | MAPPING
        | MASTER
        | MATCHED
        | MATERIALIZED
        | MAX
        | MAXSIZE
        | MAXTRANS
        | MAXVALUE
        | MEDIUM
        | MEMBER
        | MEMOPTIMIZE
        | MERGE
        | METADATA
        | MIN
        | MINEXTENTS
        | MINUTE
        | MINVALUE
        | MOD
        | MONITORING
        | MONTH
        | MOVEMENT
        | MULTISET
        | NAME
        | NATIONAL
        | NATURAL
        | NCHAR
        | NCHAR_CS
        | NCHR
        | NESTED
        | NEVER
        | NEW
        | NEW_NAMES
        | NEXT
        | NO
        | NOCACHE
        | NOCOPY
        | NOCYCLE
        | NOEXTEND
        | NOKEEP
        | NOLOGGING
        | NOMAPPING
        | NOMAXVALUE
        | NOMINVALUE
        | NOMONITORING
        | NONE
        | NONEDITIONABLE
        | NONSCHEMA
        | NOORDER
        | NOPARALLEL
        | NORELY
        | NOREVERSE
        | NOROWDEPENDENCIES
        | NOSCALE
        | NOSHARD
        | NOSORT
        | NOTFOUND // Illegal identifier according to documentation, but works in reality
        | NOVALIDATE
        | NULLS
        | OBJECT
        | OID
        | OIDINDEX
        | OLD
        | ONLINE
        | ONLY
        | OPAQUE
        | OPEN
        | OPERATIONS
        | OPTIMAL
        | ORDINALITY
        | ORGANIZATION
        | OUT
        | OUTER
        | OVER
        | OVERFLOW
        | OVERRIDING
        | OVERLAPS
        | PACKAGE
        | PARALLEL
        | PARALLEL_ENABLE
        | PARAMETERS
        | PARENT
        | PARTIAL
        | PARTITION
        | PARTITIONS
        | PASSING
        | PASSWORD
        | PATH
        | PCTINCREASE
        | PCTTHRESHOLD
        | PCTUSED
        | PCTVERSION
        | PERCENTILE_DISC
        | PERIOD
        | PIPE
        | PIPELINED
        | POLYMORPHIC
        | PRAGMA
        | PREBUILT
        | PRECEDING
        | PRECISION
        | PRESERVE
        | PRIMARY
        | PRIOR // Invalid user identifier, but it is the name of the method for collection data types
        | PRIVATE
        | PROCEDURE
        | PROFILE
        | PUBLIC
        | PURGE
        | QUERY
        | QUOTA
        | RAISE
        | RAISE_APPLICATION_ERROR
        | RANGE
        | RAW // Invalid user identifier, but STANDARD package has this declared as subtype without quotes
        | READ
        | READS
        | REBUILD
        | RECORD
        | RECYCLE
        | REDUCED
        | REF
        | REFERENCES
        | REFERENCING
        | REFRESH
        | REJECT
        | RELATIONAL
        | RELIES_ON
        | RELY
        | RENAME
        | REPLACE
        | RESTRICT_REFERENCES
        | RESULT
        | RESULT_CACHE
        | RETENTION
        | RETURNING
        | REUSE
        | REVERSE
        | REWRITE
        | RIGHT
        | ROLLUP
        | ROW // Only allowed in UPDATE query, e.g. UPDATE tbl SET ROW = <record-data-type>
        | ROWCOUNT
        | ROWDEPENDENCIES
        | ROWID // Only allowed in queries to reference pseudocolumn and as data type
        | ROWTYPE
        | SALT
        | SAMPLE
        | SAVE
        | SAVEPOINT
        | SCALE
        | SCHEMA
        | SCN
        | SCOPE
        | SEARCH
        | SECOND
        | SECUREFILE
        | SEED
        | SEGMENT
        | SELF
        | SEQUENCE
        | SERIALIZABLE
        | SERIALLY_REUSABLE
        | SERVERERROR
        | SESSION
        | SESSIONTIMEZONE
        | SET // Invalid user identifier, but it is the name of the built-in function
        | SETS
        | SETTINGS
        | SHARD
        | SHARDED
        | SHARING
        | SHRINK
        | SHUTDOWN
        | SIBLINGS
        | SIZE // Invalid user identifier, but it is a special function to return the size (number of fields/entries) of a complex item (record, array, or map)
        | SKIP_
        | SOME
        | SORT
        | SPACE
        | SPECIFICATION
        | SPLIT
        | STARTUP
        | STATEMENT
        | STATIC
        | STATISTICS
        | STORAGE
        | STORE
        | STRING
        | SUBMULTISET
        | SUBPARTITION
        | SUBPARTITIONS
        | SUBSTITUTABLE
        | SUBTYPE
        | SUPPLEMENTAL
        | SUSPEND
        | SYNONYM
        | SYSTEM
        | TABLES
        | TABLESPACE
        | TEMPLATE
        | TEMPORARY
        | THAN
        | TIME
        | TIMESTAMP
        | TIMEZONE_ABBR
        | TIMEZONE_HOUR
        | TIMEZONE_MINUTE
        | TIMEZONE_REGION
        | TRAILING
        | TRANSACTION
        | TRANSLATE
        | TREAT
        | TRIM
        | TRUE
        | TRUNCATE
        | TRUSTED
        | TYPE
        | UNBOUNDED
        | UNCONDITIONAL
        | UNDER
        | UNLIMITED
        | UNLOCK
        | UNUSABLE
        | UNUSED
        | USABLE
        | USAGE
        | USE
        | USER // Cannot be table/column name, but can be a variable name
        | USING
        | VALIDATE // Invalid user identifier, but it is the name of the built-in function
        | VALUE
        | VARCHAR // Invalid user identifier, but STANDARD package has this declared as subtype without quotes
        | VARCHAR2 // Invalid user identifier, but STANDARD package has this declared as type without quotes
        | VARRAY
        | VARRAYS
        | VARYING
        | VERSIONS
        | VIRTUAL
        | VISIBLE
        | WAIT
        | WHEN
        | WITHIN
        | WITHOUT
        | WORK
        | WRAPPED
        | WRAPPER
        | WRITE
        | XML
        | XMLNAMESPACES
        | XMLSCHEMA
        | XMLTABLE
        | XMLTYPE
        | YEAR
        | ZONE
    );

dotInIdentifier: DOT;

identifier:
    simpleIdentifier
    (
        dotInIdentifier (simpleIdentifier | asterisk)
        | nestedCollectionSimpleIdentifier
    )*
    (LPAREN PLUS_SIGN RPAREN)?;

plainIdentifier:
    simpleIdentifierWithoutParentheses (dotInIdentifier simpleIdentifierWithoutParentheses)*;

plainRemoteIdentifier:
    simpleIdentifierWithoutParentheses (dotInIdentifier simpleIdentifierWithoutParentheses)* dbLink?;

multipartPlainIdentifier:
    simpleIdentifierWithoutParentheses (dotInIdentifier simpleIdentifierWithoutParentheses)+;

asterisk: ASTERISK;

dbLink:
    AT_SIGN (simpleIdentifierRegularIdentifier | QUOTED_IDENTIFIER)
    ((AT_SIGN | DOT) (simpleIdentifierRegularIdentifier | QUOTED_IDENTIFIER))*;

simpleIdentifier:
    (
        simpleIdentifierRegularIdentifier
        | QUOTED_IDENTIFIER
    )
    dbLink?
    simpleIdentifierParams?;

nestedCollectionSimpleIdentifier: simpleIdentifierParams;

plainIdentifierAsStringLiteral:
    plainSimpleIdentifierAsStringLiteral;

typeReferenceOpaqueFixed:
    OPAQUE FIXED simpleIdentifierParams USING LIBRARY identifier ~SEMI*;

plainSimpleIdentifierAsStringLiteral:
    CHARACTER_STRING_LITERAL simpleIdentifierParams?;

simpleIdentifierParams:
    LPAREN (ALL | DISTINCT | UNIQUE)? expressionList? RPAREN;

localSimpleIdentifierWithoutParentheses:
    simpleIdentifierRegularIdentifier
    | QUOTED_IDENTIFIER;

simpleIdentifierWithoutParentheses:
    (
        simpleIdentifierRegularIdentifier
        | QUOTED_IDENTIFIER
    )
    dbLink?;

bindParameter: QUESTION_MARK;

typeReference:
    (
        typeReferenceTimestampCase
        | typeReferenceIntervalCase
        | typeReferenceCharCase
        | typeReferenceLongAndRawCase
        | typeReferenceRefCase
        | LPAREN booleanLiteral COMMA booleanLiteral RPAREN
        | typeReferenceOpaqueFixed
        | identifierDoublePrecision
        | identifier
    )
    typeReferenceAttributes?;

identifierTimestamp: TIMESTAMP simpleIdentifierParams?;

identifierTime: TIME simpleIdentifierParams?;

identifierWith: WITH simpleIdentifierParams?;

identifierLocal: LOCAL simpleIdentifierParams?;

identifierZone: ZONE simpleIdentifierParams?;

identifierInterval: INTERVAL simpleIdentifierParams?;

identifierTo: TO simpleIdentifierParams?;

identifierLong: LONG simpleIdentifierParams?;
identifierRaw: RAW simpleIdentifierParams?;
identifierLongRaw: LONG identifierRaw;

identifierDoublePrecision: DOUBLE PRECISION simpleIdentifierParams?;

identifierCharacter: ( CHAR | CHARACTER ) VARYING? charIdentifierParams? collationSpecClause?;

identifierNationalCharacter: NATIONAL ( CHAR | CHARACTER ) VARYING? simpleIdentifierParams? collationSpecClause?;

identifierNChar: NCHAR VARYING? simpleIdentifierParams? collationSpecClause?;

identifierNVarChar2: NVARCHAR2 simpleIdentifierParams? collationSpecClause?;

identifierVarChar: VARCHAR charIdentifierParams? collationSpecClause?;

identifierVarChar2: VARCHAR2 charIdentifierParams? collationSpecClause?;

identifierString: STRING charIdentifierParams? collationSpecClause?;

charIdentifierParams:
    LPAREN fullExpression ( BYTE | CHAR )? RPAREN;

typeReferenceTimestampCase:
    (identifierTimestamp | identifierTime)
    (identifierWith identifierLocal? identifierTime identifierZone)?;

typeReferenceIntervalCase:
    identifierInterval identifier identifierTo identifier;

typeReferenceCharCase:
    identifierCharacter
    | identifierVarChar
    | identifierVarChar2
    | identifierNChar
    | identifierNVarChar2
    | identifierString
    | identifierNationalCharacter;

collationSpecClause:
    COLLATE localSimpleIdentifierWithoutParentheses;

typeReferenceLongAndRawCase:
    identifierRaw
    | identifierLongRaw
    | identifierLong;

typeReferenceAttributes:
    typeReferenceCharacterSetAttribute
    | typeReferenceRangeAttribute
    | typeReferenceModifierAttribute;

typeReferenceCharacterSetAttribute:
    CHARACTER SET fullExpression typeReferenceCharacterSetModifier?;

typeReferenceCharacterSetModifier: PERCENT_SIGN CHARSET;

typeReferenceRangeAttribute:
    RANGE fullExpression delimiterDoubleDot fullExpression;

delimiterDoubleDot: DOUBLE_DOT_OPERATOR;

typeReferenceModifierAttribute: PERCENT_SIGN (TYPE | ROWTYPE);

typeReferenceRefCase: REF identifier;

fullExpression: fullOrCondition;

fullOrCondition: fullAndCondition (OR fullAndCondition)*;

fullAndCondition: fullUnaryCondition (AND fullUnaryCondition)*;

fullUnaryCondition:
    NOT? (fullAtomicCondition | fullAtomicCondition1);

fullAtomicCondition:
    delimiterCurrentOf identifier
    | delimiterExists flattenedQuery
    | multiColumnCondition;

delimiterCurrentOf: CURRENT OF;

delimiterExists: EXISTS;

fullAtomicCondition1:
    pureExpression
    (
        comparisonPairOperator
        (
            (delimiterAny | delimiterSome | delimiterAll) (flattenedQuery | comparisonList)
            | pureExpression
        )
        | collectionsComparison
        | typesComparison
        | delimiterNot? betweenOperator pureExpression betweenAndOperator pureExpression
        | delimiterIs delimiterNot? delimiterOperandOfIs
        | delimiterNot? likeOperator pureExpression escapeClause?
        |
        delimiterNot? delimiterIn
        (
            flattenedQuery
            | inPureExpression
            | delimiterLParen expressionList delimiterRParen
        )
    )?;

inPureExpression: pureExpression;

delimiterAny: ANY;

delimiterSome: SOME;

delimiterAll: ALL;

delimiterNot: NOT;

delimiterIs: IS;

delimiterIn: IN;

delimiterLParen: LPAREN;

delimiterRParen: RPAREN;

typesComparison: IS NOT? OF TYPE? typeComparisonNames;

typeComparisonNames:
    LPAREN ONLY? plainIdentifier (COMMA plainIdentifier)* RPAREN;

pureExpression: bitwiseLevelExpression | asterisk;

bitwiseLevelExpression:
    addLevelExpression (addLevelOperator addLevelExpression)*;

addLevelExpression:
    powerExpression (divideLevelOperator powerExpression)*;

addLevelOperator: PLUS_SIGN | MINUS_SIGN | CONCAT_OPERATOR;

divideLevelOperator: ASTERISK | FSLASH | MOD;

unaryExpression:
    (
        delimiterNull
        | literal
        | castExpression
        | cursorExpression
        | trimExpression
        | treatExpression
        | caseExpression
        | decodeExpression
        | extractDatetimeExpression
        | extractXMLExpression
        | newExpression
        | MINUS_SIGN unaryExpression
        | PLUS_SIGN unaryExpression
        | priorExpression
        | connectByRootExpression
        | sysConnectByPathExpression
        | translateExpression
        | charExpression
        | flattenedQuery
        | LPAREN fullExpression RPAREN
        | xmlaggExpression
        | cursorAttributeExpression
        | bulkExpression
        | overExpression
        | withinExpression
        | keepExpression
        | identifier
        | bindParameter
        | xmlQuery
        | xmlCast
    )
    dateTimeAtClause?;

xmlQuery:
    xmlQueryDelegate;

xmlQueryDelegate:
    XMLQUERY LPAREN pureExpression PASSING (BY VALUE)? xmlPassingParameterList RETURNING CONTENT RPAREN;

xmlPassingParameterList:
    xmlPassingParameterListItem (COMMA xmlPassingParameterListItem)*;

xmlPassingParameterListItem:
    pureExpression (AS identifier)?;

xmlCast:
    XMLCAST LPAREN (MULTISET flattenedQuery | fullExpression) AS typeReference RPAREN;

newExpression: NEW identifier;

treatExpression:
    TREAT treatExpressionParameters treatExpressionReturnValue?;

treatExpressionParameters:
    LPAREN fullExpression treatExpressionAsClause RPAREN;

treatExpressionAsClause: AS REF? plainIdentifier;

treatExpressionReturnValue: DOT identifier;

multisetExpression:
    unaryExpression (operators = multisetOperator unaryExpression)*;
multisetOperator:
    MULTISET (EXCEPT | INTERSECT | UNION) (DISTINCT | ALL)?;

dateTimeAtClause:
    AT (dateTimeAtLocalClause | dateTimeAtTimeZoneClause);

dateTimeAtLocalClause: LOCAL;

dateTimeAtTimeZoneClause:
    TIME ZONE (DBTIMEZONE | SESSIONTIMEZONE | unaryExpression);

keepExpression: identifier keepClause overExpressionParams?;

keepClause:
    KEEP LPAREN DENSE_RANK (FIRST | LAST) orderByClause RPAREN;

withinExpression:
    identifier withinExpressionParams overExpressionParams?;

withinExpressionParams:
    WITHIN GROUP LPAREN withinGroupOrderByClause RPAREN;

overExpression: identifier overExpressionParams;

overExpressionParams:
    OVER LPAREN overExpressionPartitionClause? (overOrderByClause overExpressionWindowingClause?)? RPAREN;

overExpressionPartitionClause: PARTITION BY expressionList;

overExpressionWindowingClause:
    (ROWS | RANGE) (overExpressionWindowingClauseBetween | overExpressionWindowingClauseSingle);

overExpressionWindowingClauseBetween:
    BETWEEN overExpressionWindowingClauseItem AND overExpressionWindowingClauseItem;

overExpressionWindowingClauseSingle:
    overExpressionWindowingClauseItem;

overExpressionWindowingClauseItem:
    UNBOUNDED (PRECEDING | FOLLOWING)
    | CURRENT ROW
    | overExpressionWindowingClauseItemExpression (PRECEDING | FOLLOWING);

overExpressionWindowingClauseItemExpression: fullExpression;

cursorAttributeExpression:
    identifier PERCENT_SIGN
    (
        FOUND
        | ISOPEN
        | NOTFOUND
        | ROWCOUNT
    );

bulkExpression:
    identifier PERCENT_SIGN
    (
        bulkExceptionExpression
        | bulkRowCountExpression
    );

bulkExceptionExpression:
    BULK_EXCEPTIONS
    (
        DOT COUNT
        | collectionIndex DOT (ERROR_INDEX | ERROR_CODE)
    );

bulkRowCountExpression: BULK_ROWCOUNT collectionIndex;

collectionIndex: LPAREN fullExpression RPAREN;

powerExpression:
    multisetExpression (POWER_OPERATOR multisetExpression)?;

delimiterNull: NULL;

delimiterNan: NAN;

delimiterInfinite: INFINITE;

delimiterOperandOfIs:
    delimiterNull
    | delimiterNan
    | delimiterInfinite;

castExpression:
    CAST LPAREN (MULTISET flattenedQuery | fullExpression) AS typeReference RPAREN;

cursorExpression: CURSOR LPAREN selectStatement RPAREN;

caseExpression:
    CASE (searchedCaseExpression | simpleCaseExpression) END;

simpleCaseExpression:
    fullExpression simpleCaseWhenEntry+ caseElseEntry?;

simpleCaseWhenEntry: WHEN fullExpression THEN fullExpression;

caseElseEntry: ELSE fullExpression;

searchedCaseExpression: searchedCaseWhenEntry+ caseElseEntry?;

searchedCaseWhenEntry: WHEN fullExpression THEN fullExpression;

priorExpression: PRIOR unaryExpression;

connectByRootExpression: CONNECT_BY_ROOT unaryExpression;

sysConnectByPathExpression:
    SYS_CONNECT_BY_PATH simpleIdentifierParams;

trimExpression:
    TRIM LPAREN trimExtClause? fullExpression RPAREN;

trimExtClause:
    (
        (LEADING | TRAILING | BOTH) fullExpression?
        | fullExpression
    )
    FROM;

decodeExpression:
    DECODE LPAREN fullExpression (COMMA fullExpression)* RPAREN;

extractDatetimeExpression:
    EXTRACT LPAREN
    (
        YEAR
        | MONTH
        | DAY
        | HOUR
        | MINUTE
        | SECOND
        | TIMEZONE_HOUR
        | TIMEZONE_MINUTE
        | TIMEZONE_REGION
        | TIMEZONE_ABBR
    )
    extractDatetimeFromClause
    RPAREN;

extractXMLExpression:
    (EXTRACT | EXTRACTVALUE) LPAREN xmlTypeInstance COMMA xpathString (COMMA xmlNamespace)? RPAREN; 

xmlTypeInstance: expressionListItem;

xpathString: pureExpression;

xmlNamespace: pureExpression;

extractDatetimeFromClause: FROM delimiterDate? fullExpression;

delimiterDate: DATE;

multiColumnCondition:
    overlapsCondition
    | delimiterLParen multiItemExpressionList delimiterRParen
      (
          delimiterNot? delimiterIn
          | comparisonPairOperator
      )
      (comparisonList | flattenedQuery);

overlapsCondition: parenthesizedExpressionList OVERLAPS parenthesizedExpressionList;

comparisonList:
    LPAREN
    (
        expressionList
        | comparisonList (COMMA comparisonList)*
    )
    RPAREN;

collectionsComparison:
    collectionsComparisonSubmultiset
    | collectionsComparisonMemberOf
    | collectionsComparisonIsASet
    | collectionsComparisonIsEmpty;

collectionsComparisonSubmultiset:
    NOT? SUBMULTISET OF pureExpression;

collectionsComparisonMemberOf: NOT? MEMBER OF pureExpression;

collectionsComparisonIsASet: IS NOT? A_ SET;

collectionsComparisonIsEmpty: IS NOT? EMPTY_KEYWORD;

likeOperator: LIKE | LIKEC | LIKE2 | LIKE4;

escapeClause: ESCAPE fullExpression;

betweenOperator: BETWEEN;

betweenAndOperator: AND;

comparisonPairOperator:
    LESS_THAN GREATER_THAN
    | BANG EQUAL_SIGN
    | TILDE EQUAL_SIGN
    | GREATER_THAN EQUAL_SIGN
    | LESS_THAN EQUAL_SIGN
    | EQUAL_SIGN
    | CARET EQUAL_SIGN
    | GREATER_THAN
    | LESS_THAN;

flattenedQuery: LPAREN selectStatement RPAREN;

asFlattenedQuery: AS LPAREN selectStatement RPAREN;

flattenedQueryNestedTable:
    THE LPAREN selectStatement RPAREN
    | TABLE LPAREN (selectStatement | fullExpression) RPAREN;

fullExpressionList: fullExpressionListItem (COMMA fullExpressionListItem)*;

fullExpressionListItem: expressionListItem | LPAREN fullExpressionList RPAREN;

expressionList: expressionListItem (COMMA expressionListItem)*;

multiItemExpressionList:
    expressionListItem (COMMA expressionListItem)+;

defaultExpression: DEFAULT;

expressionListItem:
    parameterName? (fullExpression | defaultExpression) alias?;

xmlaggExpression:
    XMLAGG LPAREN fullExpression orderByClause? RPAREN;

parameterName: simpleIdentifier ASSOC_OPERATOR;

alias: AS? simpleIdentifierWithoutParentheses;

identifierList: identifier (COMMA identifier)*;

columnListElementClause: columnListItem (COMMA columnListItem)*;

columnListItem: simpleIdentifierWithoutParentheses;

complexColumnListItem: multipartPlainIdentifier;

createStatement:
    CREATE createStatementReplaceClause?
    (
        createTableStatement
        | viewStatement
        | materializedViewStatement
        | createEditionableBatchWideStatement
        | createUserStatement
        | createIndexStatement
        | createSequenceStatement
    );
createStatementReplaceClause: OR REPLACE;

createUserStatement:
    USER localSimpleIdentifierWithoutParentheses IDENTIFIED createUserIdentificationClause createUserOption*;

createUserIdentificationClause:
    createUserPasswordIdentificationClause
    | createUserExternalIdentificationClause
    | createUserGlobalIdentificationClause
    | createUserNoAuthenticationClause;

createUserPasswordIdentificationClause:
    BY (localSimpleIdentifierWithoutParentheses | VALUES characterStringLiteral);

createUserExternalIdentificationClause:
    EXTERNALLY (AS characterStringLiteral)?;

createUserGlobalIdentificationClause:
    GLOBALLY (AS characterStringLiteral)?;

createUserNoAuthenticationClause:
    NO AUTHENTICATION;

createUserOption:
    defaultCollationOption
    | createUserDefaultTablespaceOption
    | createUserTemporaryTablespaceOption
    | createUserTablespaceQuotaOption
    | createUserProfileOption
    | createUserPasswordExpireOption
    | createUserAccountOption
    | createUserEnableEditionsOption
    | createUserContainerOption;

defaultCollationOption:
    DEFAULT COLLATION localSimpleIdentifierWithoutParentheses;

createUserDefaultTablespaceOption:
    DEFAULT TABLESPACE localSimpleIdentifierWithoutParentheses;

createUserTemporaryTablespaceOption:
    LOCAL? TEMPORARY TABLESPACE localSimpleIdentifierWithoutParentheses;

createUserTablespaceQuotaOption:
    QUOTA (UNLIMITED | byteSizeLiteral) ON localSimpleIdentifierWithoutParentheses;

createUserProfileOption:
    PROFILE localSimpleIdentifierWithoutParentheses;

createUserPasswordExpireOption:
    PASSWORD EXPIRE;

createUserAccountOption:
    ACCOUNT (LOCK | UNLOCK);

createUserEnableEditionsOption:
    ENABLE EDITIONS;

createUserContainerOption:
    CONTAINER EQUAL_SIGN (CURRENT | ALL);

createIndexStatement:
    (UNIQUE | BITMAP)? INDEX plainIdentifier ON
    (
        clusterIndexClause
        | tableIndexClause
        | bitmapJoinIndexClause
    )
    (USABLE | UNUSABLE)?
    ((DEFERRED | IMMEDIATE) INVALIDATION)?;

clusterIndexClause:
    CLUSTER plainIdentifier indexAttribute*;

tableIndexClause:
    plainIdentifier simpleAliasIdentifier?
    LPAREN tableIndexExpression (COMMA tableIndexExpression)* RPAREN
    indexProperties?;

tableIndexExpression:
    fullExpression (ASC | DESC)?;

bitmapJoinIndexClause:
    plainIdentifier LPAREN bitmapJoinIndexExpression RPAREN
    FROM bitmapJoinIndexFromClauseItem (COMMA bitmapJoinIndexFromClauseItem)*
    whereClause 
    localPartitionedIndex?
    indexAttribute*;

bitmapJoinIndexExpression:
    plainIdentifier (ASC | DESC)?;

bitmapJoinIndexFromClauseItem:
    plainIdentifier simpleAliasIdentifier?;

indexProperties:
    (
        globalPartitionedIndex
        | localPartitionedIndex
        | indexAttribute
    )+
    | indexTypeClause;

globalPartitionedIndex:
    GLOBAL partitioningDefinitionClause;

localPartitionedIndex:
    LOCAL indexOnSimplePartitionedTableClause
    | indexOnHashPartitionedTable
    | indexOnCompPartitionedTable;

// This maps to Oracle's 'on_range_partitioned_table' and 'on_list_partitioned_table'
indexOnSimplePartitionedTableClause:
    LPAREN indexOnSimplePartitionedTableClauseItem (COMMA indexOnSimplePartitionedTableClauseItem)* RPAREN;

indexOnSimplePartitionedTableClauseItem:
    PARTITION localSimpleIdentifierWithoutParentheses?
    (segmentAttributesClause | indexCompressionClause)*
    (USABLE | UNUSABLE)?;

indexOnHashPartitionedTable:
    partitionsStoreInClause
    | LPAREN indexOnHashPartitionedTableClauseItem (COMMA indexOnHashPartitionedTableClauseItem)* RPAREN;

indexOnHashPartitionedTableClauseItem:
    PARTITION localSimpleIdentifierWithoutParentheses? simpleTablespaceClause? indexCompressionClause? (USABLE | UNUSABLE);

indexOnCompPartitionedTable:
    partitionsStoreInClause? LPAREN indexOnCompPartitionedTableClauseItem (COMMA indexOnCompPartitionedTableClauseItem)* RPAREN;

indexOnCompPartitionedTableClauseItem:
    indexOnSimplePartitionedTableClauseItem indexSubpartitionClause;

indexSubpartitionClause:
    partitionsStoreInClause
    | LPAREN indexSubpartitionClauseItem (COMMA indexSubpartitionClauseItem)* RPAREN;

indexSubpartitionClauseItem:
    SUBPARTITION localSimpleIdentifierWithoutParentheses? simpleTablespaceClause? indexCompressionClause? (USABLE | UNUSABLE);

indexAttribute:
    physicalAttribute
    | loggingClause
    | ONLINE
    | COMPUTE STATISTICS
    | tablespaceClause
    | indexCompressionClause
    | sortNoSortClause
    | REVERSE
    | visibilityClause
    | partialIndexClause
    | parallelClause;

visibilityClause:
    VISIBLE | INVISIBLE;

partialIndexClause:
    INDEXING (PARTIAL | FULL);

// NOTE: XML index will have index type ('plainIdentifier' in the rule below) set to XDB.XMLINDEX
indexTypeClause:
    INDEXTYPE IS plainIdentifier localIndexClause? parallelClause? unstructuredIndexParametersClause?;

localIndexClause:
    LOCAL LPAREN localIndexClauseItem (COMMA localIndexClauseItem) RPAREN;

localIndexClauseItem:
    PARTITION localSimpleIdentifierWithoutParentheses unstructuredIndexParametersClause?;

unstructuredIndexParametersClause:
    PARAMETERS LPAREN characterStringLiteral RPAREN;

simpleTablespaceClause:
    TABLESPACE localSimpleIdentifierWithoutParentheses;

createSequenceStatement:
    SEQUENCE plainIdentifier createSequenceSharingClause? sequenceOption*;

createSequenceSharingClause:
    SHARING EQUAL_SIGN (METADATA | DATA | NONE);

createEditionableBatchWideStatement:
    editionOptionClause?
    (
        procedureStatement
        | functionStatement
        | triggerStatement
        | packageBodyStatement
        | packageStatement
        | createTypeBodyStatement
        | createTypeStatement
        | createSynonymStatement
    );

editionOptionClause: EDITIONABLE | NONEDITIONABLE;

packageStatement:
    PACKAGE plainIdentifier
    (
        WRAPPED ~FSLASH*
        | invokerRightsClause? routineBodyAsIsClause packageDeclarationBlock endClause
    );

packageBodyStatement:
    PACKAGE BODY plainIdentifier
    (
        WRAPPED ~FSLASH*
        | routineBodyAsIsClause packageDeclarationBlock (blockBody | endClause)
    );

packageDeclarationBlock: declarationBlock?;

procedureStatement: procedureSignature procedureImplementation?;

procedureSignature: procedureHeader invokerRightsClause?;

procedureImplementation: routineBody | procedureCallSpecClause;

procedureHeader: PROCEDURE plainIdentifier argumentList?;

routineBody: routineBodyAsIsClause declarationBlock? blockBody;

routineBodyAsIsClause: AS | IS;

invokerRightsClause: AUTHID (DEFINER | CURRENT_USER);

procedureCallSpecClause:
    LANGUAGE (javaDeclarationClause | cDeclarationClause);

javaDeclarationClause: JAVA NAME literal;

cDeclarationClause:
    C_ cDeclarationNameClause? cDeclarationLibraryClause cDeclarationAgentClause? cDeclarationContextClause? cDeclarationParametersClause?;

cDeclarationNameClause: NAME identifier;

cDeclarationLibraryClause: LIBRARY identifier;

cDeclarationAgentClause: AGENT IN argumentList;

cDeclarationContextClause: WITH CONTEXT;

cDeclarationParametersClause:
    PARAMETERS LPAREN identifierList RPAREN;

argumentList: LPAREN (argument (COMMA argument)*)? RPAREN;

argument:
    simpleIdentifier argumentModeClause? argumentNoCopyClause? typeReference argumentDefaultValue?;

argumentNoCopyClause: NOCOPY;

argumentModeClause: IN OUT | IN | OUT;

argumentDefaultValue:
    assignType = (DEFAULT | ASSIGN_OPERATOR) fullExpression;

functionStatement: functionSignature functionImplementation?;

functionSignature:
    functionHeader functionReturnClause
    (
        invokerRightsClause
        | functionDeterministicClause
        | functionParallelEnableClause
        | functionAggregateClause
        | functionPipelinedClause
        | resultCacheClause
    )*;

functionImplementation:
    routineBody | procedureCallSpecClause;

functionHeader:
    FUNCTION (plainIdentifier | plainIdentifierAsStringLiteral) argumentList?;

functionReturnClause: RETURN typeReference;

functionDeterministicClause: DETERMINISTIC;

functionParallelEnableClause:
    PARALLEL_ENABLE parallelOnPartitionOption?;

parallelOnPartitionOption:
    LPAREN PARTITION simpleIdentifier parallelOnPartitionBy RPAREN;

parallelOnPartitionBy:
    BY
    (
        ANY
        | VALUE columnListItemInParen
        | (HASH | RANGE) columnListInParenElementClause parallelOnPartitionStreamingClause?
    );

columnListItemInParen: LPAREN columnListItem RPAREN;

parallelOnPartitionStreamingClause:
    (ORDER | CLUSTER) pureExpression parallelOnPartitionStreamingClauseBy;

parallelOnPartitionStreamingClauseBy:
    BY columnListInParenElementClause;

resultCacheClause: RESULT_CACHE resultCacheReliesOnClause?;

resultCacheReliesOnClause:
    RELIES_ON LPAREN identifier (COMMA identifier)* RPAREN;

functionAggregateClause: AGGREGATE USING identifier;

functionPipelinedClause:
    PIPELINED ((ROW | TABLE) POLYMORPHIC)? (USING identifier)?;

createTableStatement:
    tableHeader
    (
        createObjectTableStatement
        | createRelationTableStatement
        | createXMLTypeTableStatement
    )
    memOptimizeClause?
    parentClause?;

tableHeader:
    (GLOBAL TEMPORARY | PRIVATE TEMPORARY | SHARDED | DUPLICATED)?
    TABLE plainIdentifier
    (
        SHARING EQUAL_SIGN
        (
            METADATA
            | DATA
            | EXTENDED DATA
            | NONE
        )
    )?;

createObjectTableStatement:
    objectTableOfClause
    objectPropertiesListClause?
    onCommitClause?
    objectIdentifierIsClause?
    oidIndexClause?
    physicalPropertiesClause?
    tablePropertiesClause;

memOptimizeClause: (MEMOPTIMIZE FOR (READ | WRITE))+;

parentClause: PARENT plainIdentifier;

oidIndexClause: OIDINDEX identifier? oidIndexClauseList;

oidIndexClauseList:
    LPAREN (physicalAttribute | tablespaceClause)+ RPAREN;

objectIdentifierIsClause:
    OBJECT IDENTIFIER IS (SYSTEM GENERATED | PRIMARY KEY);

objectTableOfClause: OF plainIdentifier notSubstitutableClause?;

createRelationTableStatement:
    relationPropertiesListClause? defaultCollationOption? onCommitClause? physicalPropertiesClause? tablePropertiesClause;

createXMLTypeTableStatement:
    OF XMLTYPE objectPropertiesListClause?;

tablePropertiesClause:
    columnProperties?
    partitioningDefinitionClause?
    lobPropertiesListElementClause?
    parallelClause?
    rowdependenciesClause?
    monitoringClause?
    enableDisableConstraintClause*
    rowMovementClause?
    asSubqueryClause?;

columnProperties:
    (
        nestedTableColProperties
        | objectTypeColProperties
        | (varrayStorageClause | lOBStorageClause)
        | xmlTypeColumnProperties
    )+;

xmlTypeColumnProperties:
    XMLTYPE COLUMN? columnListItem
    xmlTypeStorageClause?
    xmlSchemaSpec
    (ID literal)?; // Optional ID clause is undocumented, but is produced when you script the table

xmlTypeStorageClause:
    xmlTypeStoreAsClause | xmlTypeStoreAllClause;

xmlTypeStoreAsClause:
    STORE AS ( xmlTypeStoreAsObjectRelationalClause | xmlTypeStoreAsLobClause );

xmlTypeStoreAsObjectRelationalClause:
    OBJECT RELATIONAL;

xmlTypeStoreAsLobClause:
    (SECUREFILE | BASICFILE)?
    (CLOB | BINARY XML)
    localSimpleIdentifierWithoutParentheses? // LOB_segname
    lOBPropertiesListClause?; // This should be 'LOB_parameters' clause, but  in reality Oracle allows LOB_storage_parameters clause here

xmlTypeStoreAllClause:
    STORE ALL VARRAYS AS (LOBS | TABLES);

objectTypeColProperties:
    COLUMN columnListItem substitutableColumnClause;

varrayColProperties:
    VARRAY columnListItem substitutableColumnClause;

nestedTableColProperties:
    NESTED TABLE nestedItemClause
    substitutableColumnClause?
    storeAsClause
    nestedTableObjectProperties?
    returnAsClause?;

nestedTableObjectProperties:
    LPAREN
    (
        objectPropertiesListClause
        | physicalPropertiesClause
        | columnProperties
    )
    RPAREN;

returnAsClause: RETURN AS? (LOCATOR | VALUE);

objectPropertiesListClause:
    LPAREN objectProperties (COMMA objectProperties)* RPAREN;

objectProperties:
    tableRefConstraintClause
    | tableConstraintClause
    | supplementalLoggingPropsClause
    | (complexColumnListItem | columnListItem) defaultValueClause? (columnRefConstraintClause | columnConstraintClause+)?;

storeAsClause: STORE AS plainIdentifier;

nestedItemClause:
    COLUMN_VALUE
    | (complexColumnListItem | columnListItem);

asSubqueryClause: AS selectStatement;

rowMovementClause: enableClause ROW MOVEMENT;

enableDisableConstraintClause:
    enableClause validateClause?
    (
        constraintPrimaryKeyClause
        | constraintUniqueClause
        | constraintNameClause
    )
    usingIndexConstraintClause?
    exceptionsIntoConstraintClause?
    cascadeClause?
    keepDropIndexClause?;

keepDropIndexClause: (KEEP | DROP) INDEX;

cascadeClause: CASCADE;

monitoringClause: MONITORING | NOMONITORING;

rowdependenciesClause: ROWDEPENDENCIES | NOROWDEPENDENCIES;

parallelClause: PARALLEL literal? | NOPARALLEL;

partitioningDefinitionClause:
    PARTITION BY
    (
        partitionByHashClause
        | compositePartitioning
        | partitionByRangeClause
        | partitionByListClause
    );

compositePartitioning:
    RANGE columnListInParenElementClause (subPartitionByList | subPartitionByHash) partitionDefinitionListClause;

subPartitionByHash:
    SUBPARTITION BY HASH columnListInParenElementClause (subpartitionsStoreInClause | subPartitionTemplate)?;

subpartitionsStoreInClause:
    SUBPARTITIONS literal partitionsStoreInClause?;

subPartitionByList:
    SUBPARTITION BY LIST columnListInParenElementClause subPartitionTemplate?;

subPartitionTemplate:
    SUBPARTITION TEMPLATE (subPartitionDefinitionListClause | literal);

subPartitionDefinitionListClause:
    LPAREN subPartitionDefinitionClause (COMMA subPartitionDefinitionClause)* RPAREN;

subPartitionDefinitionClause:
    SUBPARTITION simpleIdentifier listValuesClause? partitioningStorageClause?;

partitionByListClause:
    LIST columnListInParenElementClause partitionDefinitionListClause;

partitionByHashClause:
    HASH columnListInParenElementClause (partitionsSimpleClause | partitionSimpleListClause);

partitionsSimpleClause:
    PARTITIONS literal partitionsStoreInClause? overflowClause?;

partitionSimpleListClause:
    LPAREN partitionSimpleClause (COMMA partitionSimpleClause)* RPAREN;

partitionSimpleClause:
    PARTITION
    (
        partitioningStorageClause
        | simpleIdentifier partitioningStorageClause?
    )?;

partitionByRangeClause:
    partitionByRangeColumnList partitionDefinitionListClause;

partitionDefinitionListClause:
    LPAREN partitionDefinitionClause (COMMA partitionDefinitionClause)* RPAREN;

partitionDefinitionClause:
    PARTITION simpleIdentifier? (rangeValuesClause | listValuesClause) tablePartitionDescription;

tablePartitionDescription:
    segmentAttributesClause? tableCompressionClause? overflowClause?
    (
        varrayStorageClause
        | lOBStorageClause
    )*
    partitionLevelSubpartitioningClause?;

partitionLevelSubpartitioningClause:
    subpartitionsSimpleClause
    | subpartitionSpecList;

subpartitionSpecList:
    LPAREN subpartitionSpec (COMMA subpartitionSpec)* RPAREN;

subpartitionSpec:
    SUBPARTITION
    (
        partitioningStorageClause
        | listValuesClause partitioningStorageClause?
        | simpleIdentifier listValuesClause? partitioningStorageClause?
    )?;

partitioningStorageClause:
    (
        tablespaceClause
        | overflowClause
        | varrayStorageClause
        | lOBStorageClause
    )+;

listValuesClause: VALUES parenthesizedExpressionList;

subpartitionsSimpleClause:
    SUBPARTITIONS literal partitionsStoreInClause?;

partitionsStoreInClause: STORE IN tablespaceListClause;

tablespaceListClause:
    LPAREN simpleIdentifierWithoutParentheses (COMMA simpleIdentifierWithoutParentheses)* RPAREN;

varrayStorageClause:
    VARRAY simpleIdentifier substitutableColumnClause? storeAsLobClause?;

substitutableColumnClause:
    elementIsOfTypeClause
    | notSubstitutableClause;

notSubstitutableClause: NOT? SUBSTITUTABLE AT ALL LEVELS;

elementIsOfTypeClause:
    ELEMENT? IS OF TYPE? LPAREN delimiterOnly? typeReference RPAREN;

delimiterOnly: ONLY;

storeAsLobClause:
    STORE AS (SECUREFILE | BASICFILE)? LOB
    (
        lOBPropertiesListClause
        | simpleIdentifierWithoutParentheses lOBPropertiesListClause?
    );

lOBStorageClause:
    lobStoreAsClause
    (
        lOBPropertiesListClause
        | simpleIdentifierWithoutParentheses lOBPropertiesListClause?
    );

lOBPropertiesListClause:
    LPAREN
    (
        tablespaceClause
        | storageAttributesClause
        | lobPropertiesListElementClause
    )+
    RPAREN;

lobPropertiesListElementClause:
    RETENTION MAX
    | RETENTION MIN literal
    | RETENTION AUTO
    | RETENTION NONE
    | ENCRYPT USING characterStringLiteral
    | ENCRYPT IDENTIFIED BY simpleIdentifier
    | ENCRYPT SALT
    | ENCRYPT NO SALT
    | CACHE READS loggingClause?
    | COMPRESS HIGH
    | COMPRESS MEDIUM
    | ENABLE STORAGE IN ROW
    | DISABLE STORAGE IN ROW
    | CACHE
    | CHUNK literal
    | PCTVERSION literal
    | RETENTION
    | FREEPOOLS literal
    | NOCACHE loggingClause?
    | DEDUPLICATE
    | KEEP_DUPLICATES
    | DECRYPT
    | COMPRESS
    | NOCOMPRESS;

lobStoreAsClause:
    LOB LPAREN simpleIdentifier (COMMA simpleIdentifier)* RPAREN STORE AS;

rangeValuesClause: VALUES LESS THAN valuesLessThanListClause;

valuesLessThanListClause:
    LPAREN valuesLessThanListItem (COMMA valuesLessThanListItem)* RPAREN;

valuesLessThanListItem: MAXVALUE | literal;

partitionByRangeColumnList:
    RANGE columnListInParenElementClause;

physicalPropertiesClause:
    deferredSegmentCreationClause? physicalPropertiesOrganizationClause
    // Oracle documentation claims that `tableCompressionClause` will follow `segmentAttributesClause`, but in reality
    // elements from each can appear in any order, so we unwrap `segmentAttributesClause` into separate elements here
    | deferredSegmentCreationClause? (segmentAttributesClauseElement | tableCompressionClause)+ // TODO: Add `| inmemory_table_clause | ilm_clause`
    | physicalPropertiesClusterClause;

physicalPropertiesClusterClause:
    CLUSTER simpleIdentifierWithoutParentheses columnListInParenElementClause;

physicalPropertiesOrganizationClause:
    ORGANIZATION
    (
        /*
            According to Oracle documentaiton, organization clauses below should follow the segment attributes clause,
            but in reality options from each can appear in any order, so we inline table organization clauses here and
            allow them to be mixed with segment attributes. From what I understand, there is a common set (segment attributes)
            and specific sets (one for heaps and one for indexed tables). There is no way to depict that in BNF diagram,
            so they just made it look like one will follow the other, but in reality it can be any of the common + specific.
        */
        HEAP (segmentAttributesClauseElement | heapOrganizedTableClauseElement)+
        | INDEX (segmentAttributesClauseElement | indexOrganizedTableClauseElement)+ indexOrganizedOverflowClause?
    );

deferredSegmentCreationClause:
    SEGMENT CREATION (IMMEDIATE | DEFERRED);

heapOrganizedTableClauseElement:
    tableCompressionClause; // TODO: Add `| inmemory_table_clause | ilm_clause`

indexOrganizedTableClauseElement:
    pCTThresholdClause
    | indexCompressionClause
    | mappingTableClause;

indexOrganizedOverflowClause:
    includingOverflowClause? overflowClause segmentAttributesClause?;

overflowClause:
    OVERFLOW segmentAttributesClause? partitionsStoreInClause?;

includingOverflowClause:
    INCLUDING simpleIdentifierWithoutParentheses;

pCTThresholdClause: PCTTHRESHOLD literal;

mappingTableClause: MAPPING TABLE | NOMAPPING;

tableCompressionClause:
    COMPRESS compressionOperations? literal?
    | ROW STORE COMPRESS (BASIC | ADVANCED)?
    | COLUMN STORE COMPRESS (FOR (QUERY | ARCHIVE) (LOW | HIGH)?)? (NO? ROW LEVEL LOCKING)?
    | NOCOMPRESS;

indexCompressionClause:
    COMPRESS (ADVANCED (LOW | HIGH) | literal?)
    | NOCOMPRESS;

compressionOperations: FOR (ALL | DIRECT_LOAD) OPERATIONS;

segmentAttributesClause: segmentAttributesClauseElement+;

segmentAttributesClauseElement:
    tablespaceClause
    | loggingClause
    | physicalAttribute;

onCommitClause: ON COMMIT (DELETE | PRESERVE) ROWS;

relationPropertiesListClause:
    LPAREN relationPropertiesClause (COMMA relationPropertiesClause)* RPAREN;

relationPropertiesClause:
    tableRefConstraintClause
    | tableConstraintClause
    | supplementalLoggingPropsClause
    | columnDeclarationClause;

supplementalLoggingPropsClause:
    SUPPLEMENTAL LOG (supplementalLogGrpClause | supplementalIdKeyClause);

supplementalLogGrpClause:
    GROUP simpleIdentifierWithoutParentheses columnListInParenElementClause ALWAYS?;

supplementalIdKeyClause:
    DATA LPAREN supplementalIdKeyClauseItem (COMMA supplementalIdKeyClauseItem)* RPAREN COLUMNS;

supplementalIdKeyClauseItem:
    ALL
    | PRIMARY KEY
    | UNIQUE
    | FOREIGN KEY;

columnDeclarationClause:
    simpleIdentifierWithoutParentheses typeReference sortNoSortClause?
    (columnDefaultValueClause | columnIdentityClause | virtualColumnDefinition)?
    (columnRefConstraintClause | columnConstraintClause+)?;

columnIdentityClause:
    GENERATED (ALWAYS | BY DEFAULT (ON NULL)?)? AS IDENTITY
        (
            LPAREN identityOption* RPAREN
            | identityOption*
        );

columnDefaultValueClause:
    DEFAULT (ON NULL)? fullExpression;

// According to Oracle docs, visbilityClause should come before the VIRTUAL keyword and GENERATED ALWAYS clause,
// but in reality Oracle only allows it at the end
virtualColumnDefinition:
    (GENERATED ALWAYS)? AS LPAREN computedColumnExpression RPAREN VIRTUAL? visibilityClause?;

computedColumnExpression: fullExpression;

tableRefConstraintClause:
    tableRefWithRowidClause
    | tableRefForeignKeyClause
    | tableRefScopeForClause;

tableRefWithRowidClause:
    REF columnListInParenElementClause WITH ROWID;

tableRefScopeForClause:
    SCOPE FOR columnListInParenElementClause IS plainIdentifier;

columnRefConstraintClause:
    constraintNameClause? constraintForeignKeyRefClause onDeleteActionClause? constraintStateClause?
    | withRowidClause
    | scopeIsClause;

withRowidClause: WITH ROWID;

scopeIsClause: SCOPE IS plainIdentifier;

foreignKeyClause: FOREIGN KEY columnListInParenElementClause;

tableRefForeignKeyClause:
    constraintNameClause? foreignKeyClause constraintForeignKeyRefClause onDeleteActionClause? constraintStateClause?;

materializedViewStatement:
    materializedViewHeader AS viewBody;

materializedViewHeader:
    MATERIALIZED VIEW plainIdentifier
    objectMaterializedViewClause?
    viewAliasOrConstraintList?
    defaultCollationOption?
    (
        materializedViewPrebuiltTableClause
        | physicalPropertiesClause materializedViewProperties
    )?
    materializedViewUsingIndexClause?
    materializedViewRefreshClause?
    evaluationEditionClause?
    materializedViewQueryComputationClause?
    materializedViewQueryRewriteClause?;

objectMaterializedViewClause:
    OF plainIdentifier;

materializedViewPrebuiltTableClause:
    ON PREBUILT TABLE ((WITH | WITHOUT) REDUCED PRECISION)?;

materializedViewPhysicalClusterProperties:
    CLUSTER localSimpleIdentifierWithoutParentheses materializedViewPhysicalClusterColumnList;

materializedViewPhysicalClusterColumnList:
    LPAREN localSimpleIdentifierWithoutParentheses+ RPAREN;

materializedViewProperties:
    columnProperties?
    partitioningDefinitionClause?
    materializedViewPropertiesCacheClause?
    parallelClause?
    materializedViewPropertiesBuildClause?;

materializedViewPropertiesCacheClause: CACHE | NOCACHE;

materializedViewPropertiesBuildClause:
    BUILD (IMMEDIATE | DEFERRED);

materializedViewUsingIndexClause:
    USING
    (
        NO INDEX
        | INDEX materializedViewUsingIndexAttributesListClause?
    );

materializedViewUsingIndexAttributesListClause:
    (
        tablespaceClause
        | physicalAttribute
    )+;

materializedViewRefreshClause:
    REFRESH materializedViewRefreshOptions
    | NEVER REFRESH;

materializedViewRefreshOptions:
    (
        materializedViewRefreshType
        | materializedViewRefreshTrigger
        | materializedViewRefreshSchedule
        | materializedViewRefreshRowIdentificationClause
        | materializedViewRefreshRollbackSegmentClause
        | materializedViewRefreshUsingConstraints
    )+;

materializedViewRefreshType: FAST | COMPLETE | FORCE;

materializedViewRefreshTrigger:
    ON (DEMAND | COMMIT | STATEMENT);

materializedViewRefreshSchedule:
    (START WITH | NEXT) fullExpression;

materializedViewRefreshRowIdentificationClause:
    WITH (PRIMARY KEY | ROWID);

materializedViewRefreshRollbackSegmentClause:
    USING
    (
        DEFAULT (MASTER | LOCAL)? ROLLBACK SEGMENT
        | (MASTER | LOCAL)? ROLLBACK SEGMENT localSimpleIdentifierWithoutParentheses
    );

materializedViewRefreshUsingConstraints:
    USING (ENFORCED | TRUSTED) CONSTRAINTS;

evaluationEditionClause:
    EVALUATE USING
    (
        CURRENT EDITION
        | EDITION localSimpleIdentifierWithoutParentheses
        | NULL EDITION
    );

materializedViewQueryComputationClause:
    (ENABLE | DISABLE) ON QUERY COMPUTATION;

materializedViewQueryRewriteClause:
    (ENABLE | DISABLE) QUERY REWRITE unusableEditionsBeforeClause? unusableEditionsBeginningWithClause?;

unusableEditionsBeforeClause:
    UNUSABLE BEFORE
    (
        CURRENT EDITION
        | EDITION localSimpleIdentifierWithoutParentheses
    );

unusableEditionsBeginningWithClause:
    UNUSABLE BEGINNING WITH
    (
        CURRENT EDITION
        | EDITION localSimpleIdentifierWithoutParentheses
        | NULL EDITION
    );

viewStatement:
    forceNoForceClause? editionOptionClause? EDITIONING? viewHeader viewBody;

viewHeader:
    VIEW plainIdentifier
    (
        viewAliasOrConstraintList
        | xmlTypeViewClause
        | objectViewClause
    )?
    defaultCollationOption?
    AS;

xmlTypeViewClause:
    OF XMLTYPE xmlSchemaSpec withObjectIdentifierClause;

xmlSchemaSpec:
    xmlSchemaClause?
    xmlSchemaElementClause? // According to Oracle docs this should be mandatory, but in reality it is not
    xmlTypeStoreAllClause?
    xmlSchemaSpecNonschemaClause?
    xmlSchemaSpecAnyschemaClause?;

xmlSchemaClause: XMLSCHEMA localSimpleIdentifierWithoutParentheses;

xmlSchemaElementClause:
    ELEMENT localSimpleIdentifierWithoutParentheses (POUND_SIGN localSimpleIdentifierWithoutParentheses)?;

xmlSchemaSpecNonschemaClause:
    (ALLOW | DISALLOW) NONSCHEMA;

xmlSchemaSpecAnyschemaClause:
    (ALLOW | DISALLOW) ANYSCHEMA;

objectViewClause:
    OF plainIdentifier (withObjectIdentifierClause | underClause) attributeOrConstraintList?;

underClause: UNDER plainIdentifier;

withObjectIdentifierClause:
    WITH OBJECT (IDENTIFIER | OID) (parenthesizedExpressionList | DEFAULT);

parenthesizedExpressionList: LPAREN expressionList RPAREN;

forceNoForceClause: NO? FORCE;
viewBody: selectStatement;

subqueryRestrictionClause:
    WITH (withCheckOption | withReadOnly) constraintNameClause?;

viewAliasOrConstraintList:
    LPAREN viewAliasOrTableConstraint (COMMA viewAliasOrTableConstraint)* RPAREN;

viewAliasOrTableConstraint: viewAlias | tableConstraintClause;

viewAlias: plainIdentifier columnConstraintClause*;

attributeOrConstraintList:
    LPAREN attributeOrTableConstraint (COMMA attributeOrTableConstraint)* RPAREN;

attributeOrTableConstraint:
    attributeConstraintClause
    | tableConstraintClause;

attributeConstraintClause: identifier columnConstraintClause+;

tableConstraintClause:
    constraintNameClause?
    (
        constraintUniqueClause
        | constraintPrimaryKeyClause
        | constraintForeignKeyClause
        | constraintCheckClause
    )
    constraintStateClause?;

columnListInParenElementClause:
    LPAREN (complexColumnListItem | columnListItem) (COMMA (complexColumnListItem | columnListItem))* RPAREN;

columnConstraintClause:
    constraintNameClause?
    (
        constraintNullNotNullClause
        | constraintUniqueClause
        | constraintPrimaryKeyClause
        | constraintForeignKeyClause
        | constraintCheckClause
    )
    constraintStateClause?;

constraintStateClause:
    (
        deferrableConstraintClause
        | initiallyConstraintClause
        | relyConstraintClause
        | usingIndexConstraintClause
        | enableClause
        | validateClause
        | exceptionsIntoConstraintClause
    )+;

deferrableConstraintClause: NOT? DEFERRABLE;
initiallyConstraintClause: INITIALLY (IMMEDIATE | DEFERRED);

enableClause: DISABLE | ENABLE;

relyConstraintClause: NORELY | RELY;

usingIndexConstraintClause:
    USING INDEX
    (
        usingIndexAttributesListConstraintClause
        | plainIdentifier
    );

usingIndexAttributesListConstraintClause:
    (
        loggingClause
        | tablespaceClause
        | sortNoSortClause
        | physicalAttribute
        | indexCompression
        | computeStatisticsClause
    )+;

indexCompression: prefixCompression | indexCompressionClause;

prefixCompression: (COMPRESS INTEGER_LITERAL) | NOCOMPRESS;

loggingClause: LOGGING | NOLOGGING | FILESYSTEM_LIKE_LOGGING;

tablespaceClause:
    TABLESPACE SET? (DEFAULT | simpleIdentifierWithoutParentheses);

sortNoSortClause: NOSORT | SORT;

storageAttributesClause:
    STORAGE LPAREN storageAttributeClause+ RPAREN;

storageAttributeClause:
    nextInitialStorageClause
    | minextentsStorageClause
    | pctIncreaseStorageClause
    | freeListsStorageClause
    | freeListGroupsStorageClause
    | optimalStorageClause
    | maxextentsStorageClause
    | bufferPoolStorageClause
    | flashCacheStorageClause
    | cellFlashCacheStorageClause
    | maxSizeClause
    | encryptClause;

maxSizeClause: MAXSIZE (UNLIMITED | byteSizeLiteral);

encryptClause: ENCRYPT;

nextInitialStorageClause: (INITIAL | NEXT) byteSizeLiteral;

optimalStorageClause: OPTIMAL (NULL | byteSizeLiteral?);

minextentsStorageClause: MINEXTENTS literal;

maxextentsStorageClause: MAXEXTENTS (UNLIMITED | literal);

pctIncreaseStorageClause: PCTINCREASE literal;

freeListsStorageClause: FREELISTS literal;

freeListGroupsStorageClause: FREELIST GROUPS literal;

bufferPoolStorageClause: BUFFER_POOL (KEEP | RECYCLE | DEFAULT);

flashCacheStorageClause: FLASH_CACHE (KEEP | NONE | DEFAULT);

cellFlashCacheStorageClause:
    CELL_FLASH_CACHE (KEEP | NONE | DEFAULT);

computeStatisticsClause: COMPUTE STATISTICS;

validateClause: VALIDATE | NOVALIDATE;

exceptionsIntoConstraintClause: EXCEPTIONS INTO plainIdentifier;

byteSizeLiteral: BYTE_SIZE_LITERAL | INTEGER_LITERAL;

constraintNameClause: CONSTRAINT simpleIdentifier;

constraintNullNotNullClause: NOT? NULL;

constraintUniqueClause: UNIQUE columnListInParenElementClause?;

constraintPrimaryKeyClause:
    PRIMARY KEY columnListInParenElementClause?;

constraintCheckClause: CHECK conditionInParens;

conditionInParens: LPAREN fullExpression RPAREN;

constraintForeignKeyClause:
    (FOREIGN KEY)? columnListInParenElementClause? constraintForeignKeyRefClause onDeleteActionClause?;

constraintForeignKeyRefClause:
    REFERENCES plainIdentifier columnListInParenElementClause?;

onDeleteActionClause: ON DELETE (CASCADE | SET NULL);

triggerStatement: TRIGGER plainIdentifier
    (
        simpleDmlTrigger
        | insteadOfDmlTrigger
        | compoundDmlTrigger
        | systemTrigger
    );

simpleDmlTrigger:
    triggerCallTypeClause
    dmlTriggerEventClause
    createTriggerWhenClause?
    (callStatement | blockStatement);

insteadOfDmlTrigger:
    triggerCallTypeClause
    dmlTriggerEventClause
    (callStatement | blockStatement);

compoundDmlTrigger:
    triggerCallTypeClause
    dmlTriggerEventClause
    createTriggerWhenClause?
    compoundTriggerBlock;

systemTrigger:
    triggerCallTypeClause
    (ddlEventsListClause | databaseEventsListClause)
    triggerStatementOnClause
    (callStatement | blockStatement);

compoundTriggerBlock:
    COMPOUND TRIGGER declarationBlock? timingPointSection+ endClause;

timingPointSection: timingPoint IS blockBody timingPoint SEMI;

timingPoint: ((BEFORE | AFTER) STATEMENT) | 
             ((BEFORE | AFTER | INSTEAD OF) EACH ROW);

callStatement: CALL identifier callIntoClause?;

callStatementWithExpression: fullExpression DOT identifier;

callIntoClause: INTO simpleIdentifier indicatorClause?;

indicatorClause: INDICATOR? simpleIdentifier;

createTriggerWhenClause: WHEN conditionInParens;

triggerStatementOnClause: ON (SCHEMA | DATABASE);

ddlEventsListClause: ddlEvent (OR ddlEvent)*;

databaseEventsListClause: databaseEvent (OR databaseEvent)*;

ddlEvent:
    ALTER
    | ANALYZE
    | ASSOCIATE STATISTICS
    | AUDIT
    | COMMENT
    | CREATE
    | DISASSOCIATE STATISTICS
    | DROP
    | GRANT
    | NOAUDIT
    | RENAME
    | REVOKE
    | TRUNCATE
    | DDL;

databaseEvent:
    SERVERERROR
    | LOGON
    | LOGOFF
    | STARTUP
    | SHUTDOWN
    | SUSPEND;

triggerCallTypeClause: BEFORE | AFTER | INSTEAD OF | FOR;

dmlTriggerEventClause:
    dmlTriggerEventsList dmlTriggerEventOnClause referencingClause? forEachRowClause?;

dmlTriggerEventsList: dmlTriggerEvent (OR dmlTriggerEvent)*;

dmlTriggerEvent: (INSERT | DELETE | UPDATE) ofColumnListClause?;

ofColumnListClause: OF columnListElementClause;

dmlTriggerEventOnClause:
    ON (nestedTableClause plainIdentifier | plainIdentifier);

nestedTableClause:
    NESTED TABLE simpleIdentifierWithoutParentheses OF;

referencingClause: REFERENCING referencingItem+;

referencingItem: (NEW | OLD | PARENT) AS? simpleIdentifier;

forEachRowClause: FOR EACH ROW;

returningClause:
    RETURNING expressionList (intoClause | bulkCollectIntoClause);

onlyClause: ONLY LPAREN fromClauseItem RPAREN;

selectStatement:
    subqueryFactoringClause?
    selectStatementMember
    (unionOperator selectStatementMember)*
    (
        orderByClause forUpdateClause?
        | forUpdateClause orderByClause?
    )?
    subqueryRestrictionClause?;

selectStatementMember:
    basicSelectStatement
    | LPAREN selectStatement RPAREN;

unionOperator: UNION ALL | UNION | MINUS | INTERSECT;

withCheckOption: CHECK OPTION;

withReadOnly: READ ONLY;

overOrderByClause: ORDER SIBLINGS? BY orderByList;

withinGroupOrderByClause: ORDER SIBLINGS? BY orderByList;

orderByClause: ORDER SIBLINGS? BY orderByList;

orderByList: orderByListItem (COMMA orderByListItem)*;

orderByListItem:
    fullExpression ascDescSortAtrtributeClause? orderByNullsAttributeClause?;

ascDescSortAtrtributeClause: ASC | DESC;

orderByNullsAttributeClause: NULLS (FIRST | LAST);

forUpdateClause:
    FOR UPDATE (delimiterOf identifierList)? (waitOrNowaitClause | skipLockedClause)?;

delimiterOf: OF;

waitOrNowaitClause: NOWAIT | WAIT literal;

skipLockedClause: SKIP_ LOCKED;

subqueryFactoringClause:
    WITH subqueryFactoringClauseItem (COMMA subqueryFactoringClauseItem)*;

subqueryFactoringClauseItem:
    plainIdentifier subqueryFactoringColumnsList? asFlattenedQuery searchClause? cycleClause?;

subqueryFactoringColumnsList: LPAREN identifierList RPAREN;

searchClause: SEARCH (DEPTH | BREADTH) FIRST BY orderByList subqueryFactoringSetClause;

subqueryFactoringSetClause: SET plainIdentifier;

cycleClause: CYCLE identifierList subqueryFactoringSetClause toCycleClause defaultCycleClause;

toCycleClause: TO literal;

defaultCycleClause: DEFAULT literal;

basicSelectStatement:
    SELECT (DISTINCT | ALL | UNIQUE)? selectExpressionList
    (intoClause | bulkCollectIntoClause)?
    fromClause
    whereClause?
    (
        connectByClause startWithClause?
        | startWithClause connectByClause
    )?
    (
        groupByClause havingClause?
        | havingFirst = havingClause groupByClause?
    )?;

selectExpressionList: expressionList;

intoClause: INTO identifierList;

whereClause: WHERE fullExpression;

groupByClause: GROUP BY groupByClauseExpressionList;

groupByClauseExpressionList: groupByComplexExpressionList;

groupByComplexExpressionList:
    groupByComplexListExpressionItem (COMMA groupByComplexListExpressionItem)*;

groupByComplexListExpressionItem:
    groupByClauseExpressionListItem
    | groupByComplexExpressionListWithParenthesis;

groupByComplexExpressionListWithParenthesis:
    LPAREN groupByComplexListExpressionItem (COMMA groupByComplexListExpressionItem)* RPAREN;

groupByClauseExpressionListItem:
    rollupCubeClause
    | groupingSetsClause
    | grandTotal
    | fullExpression;

grandTotal: LPAREN RPAREN;

groupingSetsClause:
    GROUPING SETS LPAREN groupingSetsList RPAREN;

groupingSetsList: groupingSet (COMMA groupingSet)*;

groupingSet: grandTotal | groupingSetItemList | groupingSetItem;

groupingSetItem: rollupCubeClause | fullExpression;

groupingSetItemList:
    LPAREN fullExpression (COMMA fullExpression)* RPAREN;

rollupCubeClause: (ROLLUP | CUBE) LPAREN groupingExpressionList RPAREN;

groupingExpressionList:
    groupingExpressionListItem (COMMA groupingExpressionListItem)*;

groupingExpressionListItem:
    groupingExpressionNestedItem
    | fullExpression;

groupingExpressionNestedItem:
    LPAREN fullExpression (COMMA fullExpression)* RPAREN;

connectByClause: CONNECT BY NOCYCLE? fullExpression;

startWithClause: START WITH fullExpression;

havingClause: HAVING fullExpression;

fromClause:
    FROM complexFromClauseItem (COMMA complexFromClauseItem)*;

complexFromClauseItem:
    complexFromClauseItemInner pivotUnpivotClause?;

complexFromClauseItemInner:
    fromClauseItem queryPartitionClause?
    (
        normalJoinType complexFromClauseItemInner (onCondition | usingCondition)?
        | crossOrNaturalJoin complexFromClauseItemInner
    )*;

crossOrNaturalJoin:
    CROSS JOIN
    | NATURAL (INNER | outerJoinType)? JOIN;

normalJoinType: (outerJoinType | INNER)? JOIN;

outerJoinType: type = (LEFT | RIGHT | FULL) OUTER?;

onCondition: ON fullExpression;

usingCondition:
    USING LPAREN identifier (COMMA identifier)* RPAREN;

queryPartitionClause: PARTITION BY LPAREN expressionList RPAREN;

fromClauseItemPartitionClause: (PARTITION | SUBPARTITION) LPAREN identifier RPAREN;

fromClauseItem:
    (
        plainIdentifier
        (
            fromClauseItemPartitionClause sampleClause?
            | sampleClause
        )?
        | LPAREN complexFromClauseItem RPAREN
        | xmlTableItem
        | flattenedQueryNestedTable
        | flattenedQuery
        | jsonTable
    )
    flashbackAndPivotClauses?
    (
        {IsAliasIdentifier()}? aliasIdentifier?
        | /* nothing */
    );

jsonTable: JSON_TABLE LPAREN fullExpression (FORMAT JSON)? (COMMA jsonExpression)? jsonTableOnClause* jsonColumnsClause RPAREN; // Max of one each of error and empty TableOn clause allowed with them being interchangeable deviating from oracle documentation, however simplying the logic here.

jsonTableOnClause: jsonTableOnCondition (EMPTY_KEYWORD | ERROR);

jsonTableOnCondition: (ERROR | NULL) ON;

jsonExpression: plainIdentifier | literal;

jsonColumnsClause: COLUMNS LPAREN jsonColumnDefinition (COMMA jsonColumnDefinition)* RPAREN;

jsonColumnDefinition:
    jsonExistsColumn
    | jsonQueryColumn
    | jsonValueColumn
    | jsonNestedPath 
    | ordinalityColumn;

jsonExistsColumn: plainIdentifier typeReference? EXISTS (PATH jsonExpression)? jsonExistsOnClause*; // Max of one each of error and empty ExistsOn clause allowed with them being interchangeable deviating from oracle documentation, however simplying the logic here.

jsonExistsOnClause: jsonExistsOnCondition (EMPTY_KEYWORD | ERROR);

jsonExistsOnCondition: (ERROR | TRUE | FALSE) ON;

jsonQueryColumn: plainIdentifier typeReference? TRUNCATE? FORMAT JSON jsonQueryWrapperClause? (PATH jsonExpression)? jsonQueryOnClause*; // Max of one each of error and empty QueryOn clause allowed with them being interchangeable deviating from oracle documentation, however simplying the logic here.

jsonQueryWrapperClause: (WITH (CONDITIONAL | UNCONDITIONAL)? | WITHOUT) ARRAY? WRAPPER;

jsonQueryOnClause: jsonQueryOnCondition (EMPTY_KEYWORD | ERROR);

jsonQueryOnCondition: 
    (ERROR 
    | NULL 
    | EMPTY_KEYWORD (ARRAY | OBJECT)?) ON;

jsonValueColumn: plainIdentifier typeReference? TRUNCATE? (PATH jsonExpression)? jsonValueOnClause*; // Max of one each of error and empty ValueOn clause allowed with them being interchangeable deviating from oracle documentation, however simplying the logic here.

jsonValueOnClause: jsonValueOnCondition (EMPTY_KEYWORD | ERROR);

jsonValueOnCondition: (ERROR | NULL | DEFAULT literal) ON;

jsonNestedPath: NESTED PATH? jsonExpression jsonColumnsClause;

ordinalityColumn: plainIdentifier FOR ORDINALITY;

flashbackAndPivotClauses:
    pivotUnpivotClause periodSpecification? // this is for Oracle 11 and older version
    | periodSpecification pivotUnpivotClause?; // this is for Oracle 12+

xmlTableItem:
    XMLTABLE LPAREN (xmlNamespacesClause COMMA)? literal xmlTableOptions RPAREN;

xmlNamespacesClause:
    XMLNAMESPACES LPAREN expressionList? (DEFAULT literal)? RPAREN;

xmlTableOptions:
    xmlParsingClause? (COLUMNS xmlTableColumn (COMMA xmlTableColumn)*)?;

xmlParsingClause: PASSING (BY VALUE)? expressionList;

xmlTableColumn:
    fullExpression
    (
        FOR ORDINALITY
        | typeReference (PATH literal)? (DEFAULT fullExpression)?
    );

pivotUnpivotClause: pivotClause | unpivotClause;

pivotClause: PIVOT XML? pivotBody;

pivotBody:
    LPAREN expressionList pivotForClause pivotInClause RPAREN;

pivotForClause: FOR identifierOrIdentifierList;

identifierOrIdentifierList:
    pivotUnpivotIdentifierList
    | identifier;

pivotUnpivotIdentifierList: LPAREN identifierList RPAREN;

pivotInClause: IN (flattenedQuery | pivotInExpressionList);

pivotInExpressionList:
    LPAREN pivotInExpressionListItem (COMMA pivotInExpressionListItem)* RPAREN;

pivotInExpressionListItem:
    pivotAny
    | expressionOrExpressionList alias?;

pivotAny: ANY;

expressionOrExpressionList:
    pivotExpressionList
    | fullExpression;

pivotExpressionList: LPAREN expressionList RPAREN;

unpivotClause:
    UNPIVOT (INCLUDE NULLS | EXCLUDE NULLS)? unpivotBody;

unpivotBody:
    LPAREN identifierOrIdentifierList pivotForClause unpivotInClause RPAREN;

unpivotInClause: IN unpivotInExpressionList;

unpivotInExpressionList:
    LPAREN unpivotInExpressionListItem (COMMA unpivotInExpressionListItem)* RPAREN;

unpivotInExpressionListItem:
    identifierOrIdentifierList literalOrLiteralListAlias?;

literalOrLiteralListAlias: AS literalOrLiteralList;

literalOrLiteralList: literalListWithParenthesis | literal;

literalListWithParenthesis:
    LPAREN literal (COMMA literal)* RPAREN;

periodSpecification: periodAsOfClause | periodBetweenClause;

periodAsOfClause:
    AS OF (flashBackType expressionList | periodForTimeColumn);

periodBetweenClause:
    VERSIONS (BETWEEN flashBackType | periodForTimeColumn) pureExpression AND pureExpression;

periodForTimeColumn:
    PERIOD FOR identifier (fullExpression | BETWEEN);

flashBackType: TIMESTAMP | SCN;

sampleClause:
    SAMPLE BLOCK? sampleClauseValues sampleSeedClause?;

sampleSeedClause: SEED sampleClauseValues;

sampleClauseValues: LPAREN fullExpression RPAREN;

aliasIdentifier: AS? simpleIdentifierWithoutParentheses;

simpleAliasIdentifier: localSimpleIdentifierWithoutParentheses;

insertColumnListClause: LPAREN identifierList RPAREN;

valuesClause:
    VALUES (LPAREN insertExpressionList RPAREN | identifier);

insertExpressionList: expressionList;

insertStatement:
    INSERT
    (
        singleTableInsertStatement
        | multiTableInsertStatement
        | conditionalInsertStatement
    );

singleTableInsertStatement:
    INTO fromClauseItem insertColumnListClause?
    (valuesClause | selectStatement)
    returningClause?
    errorLoggingClause?;

multiTableInsertStatement:
    ALL multiTableInsertItem+ selectStatement;

multiTableInsertItem:
    INTO fromClauseItem insertColumnListClause? valuesClause? errorLoggingClause?;

conditionalInsertStatement:
    (ALL | FIRST)? conditionalInsertWhenEntry+ conditionalInsertElseClause? selectStatement;

conditionalInsertWhenEntry:
    WHEN fullExpression conditionalInsertThenClause;

conditionalInsertThenClause: THEN multiTableInsertItem+;

conditionalInsertElseClause: ELSE multiTableInsertItem+;

setClause:
    SET (setClauseValueClause | setList (COMMA setList)*);

setClauseValueClause:
    VALUE LPAREN identifier RPAREN EQUAL_SIGN fullExpression;

setList:
    (identifier | LPAREN identifier RPAREN) EQUAL_SIGN
    (
        flattenedQuery
        | fullExpression
        | defaultExpression
    )
    | setColumnListClause EQUAL_SIGN flattenedQuery;

setColumnListClause: LPAREN identifierList RPAREN;

updateStatement:
    UPDATE (onlyClause | fromClauseItem) setClause whereClause? returningClause? errorLoggingClause?;

deleteStatement:
    DELETE FROM? (onlyClause | fromClauseItem) whereClause? returningClause? errorLoggingClause?;

closeStatement: CLOSE identifier;

fetchStatement:
    FETCH identifier (fetchTargetList | bulkCollectIntoClause) fetchLimitClause?;

fetchTargetList: INTO identifierList;

bulkCollectIntoClause: BULK COLLECT INTO identifierList;

fetchLimitClause: LIMIT fullExpression;

openStatement: OPEN identifier openForClause?;

openForClause:
    FOR (selectStatement | fullExpression usingList?);

usingList: USING usingListItem (COMMA usingListItem)*;

usingListItem: (IN OUT | IN | OUT)? fullExpression;

commitWorkStatement:
    COMMIT WORK?
    (
        commitWorkCommentClause commitWorkWriteClause?
        | commitWorkWriteClause
        | commitWorkForceClause
    )?;

commitWorkCommentClause: COMMENT literal;

commitWorkWriteClause: WRITE (IMMEDIATE | BATCH)? (WAIT | NOWAIT)?;

commitWorkForceClause: FORCE literal (COMMA INTEGER_LITERAL)?;

setTransactionStatement:
    SET TRANSACTION
    (
        (
            setTransactionReadClause
            | isolationLevelClause
            | useRollbackSegmentClause
        )
        setTransactionName?
        | setTransactionName
    );

setTransactionName: NAME literal;

setTransactionReadClause: READ (ONLY | WRITE)?;

isolationLevelClause:
    ISOLATION LEVEL (SERIALIZABLE | READ COMMITTED)?;

useRollbackSegmentClause:
    USE ROLLBACK SEGMENT simpleIdentifierWithoutParentheses;

rollbackWorkStatement: ROLLBACK WORK? toSavepointClause?;

toSavepointClause: TO SAVEPOINT? simpleIdentifier;

savepointStatement: SAVEPOINT simpleIdentifier;

assignmentStatement: identifier ASSIGN_OPERATOR fullExpression;

errorLoggingClause:
    LOG ERRORS errorLoggingIntoClause? errorLoggingTagExpression? errorLoggingRejectLimit?;

errorLoggingIntoClause: INTO identifier;

errorLoggingTagExpression: LPAREN fullExpression RPAREN;

errorLoggingRejectLimit: REJECT LIMIT (UNLIMITED | literal);

mergeStatement:
    MERGE INTO
    fromClauseItem
    mergeUsingClause
    mergeConditionClause
    mergeUpdateOrInsertClause?
    errorLoggingClause?;

mergeUpdateOrInsertClause:
    mergeUpdateClause mergeInsertClause?
    | mergeInsertClause mergeUpdateClause?;

mergeUsingClause: USING fromClauseItem;

mergeConditionClause: ON LPAREN fullExpression RPAREN;

mergeUpdateClause:
    WHEN MATCHED THEN UPDATE setClause whereClause? deleteWhereClause?;

deleteWhereClause: DELETE whereClause;

mergeInsertClause:
    WHEN NOT MATCHED THEN INSERT insertColumnListClause? valuesClause whereClause?;

executeImmediateStatement:
    EXECUTE IMMEDIATE fullExpression
    (
        intoClause
        | bulkCollectIntoClause
    )?
    usingList?
    executeReturningClause?;

executeReturningClause: (RETURNING | RETURN) intoClause;

pipeRowStatement: PIPE ROW LPAREN pureExpression RPAREN;

raiseStatement: RAISE identifier?;

truncateTableStatement:
    TRUNCATE TABLE identifier truncateTableLogClause? truncateStatementStorageClause?;

truncateTableLogClause:
    preservePurgeClause MATERIALIZED VIEW LOG;

preservePurgeClause: PRESERVE | PURGE;

truncateClusterStatement:
    TRUNCATE CLUSTER identifier truncateStatementStorageClause?;

truncateStatementStorageClause:
    clauseType = (DROP | REUSE) STORAGE;
lockTableStatement:
    LOCK TABLE lockTableItemList lockTableModeClause lockTableNowaitClause?;

lockTableItemList: fromClauseItem (COMMA fromClauseItem)*;

lockTableModeClause:
    IN
    (
        ROW (SHARE | EXCLUSIVE)
        | SHARE (UPDATE | ROW EXCLUSIVE)
        | EXCLUSIVE
    )
    MODE;

lockTableNowaitClause: NOWAIT;

translateExpression:
    TRANSLATE LPAREN fullExpression USING (CHAR_CS | NCHAR_CS) RPAREN;

charExpression:
    CHR LPAREN fullExpression USING NCHAR_CS RPAREN
    | NCHR LPAREN fullExpression RPAREN;

controlStructure:
    ifStatement
    | whileStatement
    | forStatement
    | caseStatement
    | loopStatement
    | forAllStatement;

forAllStatement:
    FORALL simpleIdentifier forAllInClause forAllSaveExceptionsClause?
    (
        insertStatement
        | deleteStatement
        | updateStatement
        | mergeStatement
        | executeImmediateStatement
    );

forAllInClause:
    IN
    (
        forAllIndicesClause
        | forAllValuesClause
        | forAllLowerUpperBoundClause
    );

forAllIndicesClause:
    INDICES OF identifier forAllIndeciesBoundsClause?;

forAllIndeciesBoundsClause:
    BETWEEN fullExpression (AND fullExpression)?;

forAllValuesClause: VALUES OF identifier;

forAllLowerUpperBoundClause:
    fullExpression delimiterDoubleDot fullExpression;

forAllSaveExceptionsClause: SAVE EXCEPTIONS;

ifStatement:
    IF fullExpression thenBlock elsIfBlock* elseBlock? END IF;

thenBlock: THEN plSqlStatementBatch;

elseBlock: ELSE plSqlStatementBatch;

elsIfBlock: ELSIF fullExpression thenBlock;

ifDirectiveStatement:
    DIRECTIVE_IF fullExpression thenDirectiveBlock elsIfDirectiveBlock* elseDirectiveBlock? DIRECTIVE_END;

thenDirectiveBlock:
    DIRECTIVE_THEN (errorDirectiveBlock | declarationBlockItem)*;

elseDirectiveBlock:
    DIRECTIVE_ELSE (errorDirectiveBlock | declarationBlockItem)*;

elsIfDirectiveBlock:
    DIRECTIVE_ELSIF fullExpression thenDirectiveBlock;

errorDirectiveBlock:
    DIRECTIVE_ERROR fullExpression DIRECTIVE_END;

loopStatement: loopBlock;

loopBlock: LOOP plSqlStatementBatch endLoopClause;

whileStatement: WHILE fullExpression loopBlock;

endLoopClause:
    END LOOP (simpleIdentifierRegularIdentifier | QUOTED_IDENTIFIER)?;

forStatement:
    FOR simpleIdentifier forStatementInClause loopBlock;

forStatementInClause:
    IN REVERSE? fullExpression (DOUBLE_DOT_OPERATOR fullExpression)?;

continueStatement: CONTINUE optionalLabelWhenCondition?;

caseStatement:
    CASE (searchedCaseStatement | simpleCaseStatement) END CASE
    (
        simpleIdentifierRegularIdentifier
        | QUOTED_IDENTIFIER
    )?;

simpleCaseStatement:
    fullExpression caseStatementWhenEntry+ elseBlock?;

searchedCaseStatement: caseStatementWhenEntry+ elseBlock?;

caseStatementWhenEntry: WHEN fullExpression thenBlock;

blockStatement: declarationBlock? blockBody;

blockBody: BEGIN plSqlStatementBatch exceptionBlock? endClause;

endClause:
    END (simpleIdentifierRegularIdentifier | QUOTED_IDENTIFIER)?;

exceptionBlock: EXCEPTION exceptionHandler+;

exceptionHandler: WHEN exceptionNameList thenBlock;

exceptionNameList: identifier (OR identifier)*;

gotoStatement: GOTO simpleIdentifierWithoutParentheses;

label: labelBody;

labelBody:
    LESS_THAN LESS_THAN simpleIdentifierWithoutParentheses GREATER_THAN GREATER_THAN;

nullStatement: NULL;

returnStatement: RETURN fullExpression?;

procedureCall: identifier;

exitStatement: EXIT optionalLabelWhenCondition?;

optionalLabelWhenCondition:
    whenCondition
    | simpleIdentifier whenCondition?;

whenCondition: WHEN fullExpression;

declarationBlock:
    declarationBlockItem+
    | DECLARE declarationBlockItem*;

declarationBlockItem:
    ifDirectiveStatement
    |
    (
        functionStatement
        | procedureStatement
        | exceptionDeclaration
        | typeDeclaration
        | subtypeDeclaration
        | cursorDeclaration
        | declarationPragma
        | variableDeclaration
    ) semi = SEMI;

notNullClause: NOT NULL;

nullClause: NULL;

defaultValueClause:
    clauseType = (DEFAULT | ASSIGN_OPERATOR) fullExpression;
cursorReturnClause: RETURN typeReference;

exceptionDeclaration: simpleIdentifier EXCEPTION;

typeDeclaration:
    TYPE simpleIdentifier (delimiterIs | delimiterAs) newType?
    (
        recordTypeDeclaration
        | varrayTypeDeclaration
        | tableTypeDeclaration
        | refCursorTypeDeclaration
        | objectTypeDeclaration
        | typeReference
    );

delimiterAs: AS;

newType: NEW;

recordTypeDeclaration:
    RECORD LPAREN recordFieldDeclaration (COMMA recordFieldDeclaration)* RPAREN;

recordFieldDeclaration:
    simpleIdentifier typeReference
    (
        notNullClause? defaultValueClause
        | nullClause defaultValueClause?
    )?;

objectTypeDeclaration:
    OBJECT LPAREN objectFieldDeclaration (COMMA recordFieldDeclaration)* RPAREN;

objectFieldDeclaration:
    simpleIdentifier typeReference
    (
        notNullClause? defaultValueClause
        | nullClause defaultValueClause?
    )?;

varrayTypeDeclaration:
    (VARRAY | VARYING ARRAY) varraySizeLimitClause typeDeclararionElementTypeClause;

varraySizeLimitClause: LPAREN literal RPAREN;

typeDeclararionElementTypeClause:
    OF typeReference (notNullClause | nullClause)?;

tableTypeDeclaration:
    TABLE typeDeclararionElementTypeClause tableTypeIndexByClause?;

tableTypeIndexByClause:
    INDEX BY typeReference (notNullClause | nullClause)?;

refCursorTypeDeclaration: REF CURSOR cursorReturnClause?;

subtypeDeclaration:
    SUBTYPE simpleIdentifier delimiterIs typeReference (notNullClause | nullClause)?;

cursorDeclaration:
    cursorHeader argumentList? cursorReturnClause? cursorSelect?;

cursorHeader: CURSOR simpleIdentifierWithoutParentheses;

cursorSelect: IS selectStatement;

declarationPragma:
    PRAGMA
    (
        exceptionInitPragma
        | autonomousTransactionPragma
        | seriallyReusablePragma
        | restrictReferencesPragma
        | builtinPragma
        | fipsflagPragma
        | interfacePragma
        | timestampPragma
        | newNamesPragma
    );

exceptionInitPragma:
    EXCEPTION_INIT LPAREN identifier COMMA fullExpression RPAREN;

autonomousTransactionPragma: AUTONOMOUS_TRANSACTION;

seriallyReusablePragma: SERIALLY_REUSABLE;

restrictReferencesPragma:
    RESTRICT_REFERENCES LPAREN identifierList? RPAREN;

builtinPragma: BUILTIN LPAREN expressionList? RPAREN;

fipsflagPragma: FIPSFLAG LPAREN expressionList? RPAREN;

interfacePragma: INTERFACE LPAREN expressionList? RPAREN;

timestampPragma: TIMESTAMP LPAREN expressionList? RPAREN;

newNamesPragma: NEW_NAMES LPAREN expressionList? RPAREN;

variableDeclaration:
    simpleIdentifier variableConstantClause? typeReference
    (
        notNullClause? defaultValueClause
        | nullClause defaultValueClause?
    )?;

variableConstantClause: CONSTANT;

dropStatement:
    DROP
    (
        dropTypeBodyStatement
        | dropTypeStatement
        | dropTriggerStatement
        | dropIndexStatement
    );

dropTypeStatement: TYPE plainIdentifier forceValidateClause?;

forceValidateClause: FORCE | VALIDATE;

dropTypeBodyStatement: TYPE BODY plainIdentifier;

dropTriggerStatement: TRIGGER plainIdentifier;

dropIndexStatement: INDEX plainIdentifier FORCE?;

alterStatement:
    ALTER
    (
        alterTypeStatement
        | alterSequenceStatement
        | alterTriggerStatement
        | alterIndexStatement
    );

alterTypeStatement:
    TYPE plainIdentifier
    (
        compileTypeClause
        | replaceTypeClause
        | alterTypeSpecifications dependentHandlingClause?
    );

alterTypeSpecifications:
    alterMethodSpecifications
    | alterCollectionClauses
    | alterAttributeDefinition
    | inheritanceClause*;

alterTriggerStatement:
    TRIGGER plainIdentifier 
    (
        ENABLE
        | DISABLE
        | renameClause
        | compileClause
    );

renameClause:
    RENAME TO simpleIdentifierWithoutParentheses;

compileClause:
    COMPILE DEBUG? compilerParametersClause? (REUSE SETTINGS)?;

alterIndexStatement:
    INDEX plainIdentifier
    (
        ENABLE
        | DISABLE
        | UNUSABLE
        | COALESCE
        | (MONITORING | NOMONITORING) USAGE
        | UPDATE BLOCK REFERENCES
        | indexOptions
        | rebuildClause
        | parametersClause
        | renameClause
        | alterIndexPartitioning
    );

indexOptions:
    (deallocateUnusedClause
    | allocateExtentClause
    | shrinkClause
    | parallelClause
    | physicalAttribute
    | loggingClause)*;

deallocateUnusedClause:
    DEALLOCATE UNUSED keepSizeClause?;

keepSizeClause:
    KEEP byteSizeLiteral;

allocateExtentClause:
    ALLOCATE EXTENT extentOptions?;

extentOptions: LPAREN extentOption+ RPAREN;

extentOption:
    SIZE byteSizeLiteral
    | DATAFILE fullExpression
    | INSTANCE literal;

shrinkClause:
    SHRINK SPACE COMPACT? CASCADE?;

physicalAttribute:
    PCTFREE literal
    | PCTUSED literal
    | INITRANS literal
    | MAXTRANS literal
    | storageAttributesClause;

rebuildClause:
    REBUILD 
    (
        PARTITION simpleIdentifierWithoutParentheses
        | SUBPARTITION simpleIdentifierWithoutParentheses
        | REVERSE
        | NOREVERSE
    )?
    rebuildOptions*;

rebuildOptions:
    parallelClause
    | tablespaceClause
    | parametersClause
    | ONLINE
    | COMPUTE STATISTICS
    | physicalAttribute
    | keyCompression
    | loggingClause;

keyCompression:
    COMPRESS literal?
    | NOCOMPRESS;

parametersClause: PARAMETERS fullExpression;

alterIndexPartitioning:
    modifyIndexDefaultAttributes
    | addHashIndexPartition
    | modifyIndexPartition
    | renameIndexPartition
    | dropIndexPartition
    | splitIndexPartition
    | coalesceIndexPartition
    | modifyIndexSubpartition;

modifyIndexDefaultAttributes:
    MODIFY DEFAULT ATTRIBUTES (FOR PARTITION simpleIdentifierWithoutParentheses)? modifyIndexAttributes+;

modifyIndexAttributes:
    physicalAttribute
    | tablespaceClause
    | loggingClause;

addHashIndexPartition:
    ADD PARTITION simpleIdentifierWithoutParentheses? tablespaceClause? parallelClause?;

coalesceIndexPartition:
    COALESCE PARTITION parallelClause?;

modifyIndexPartition:
    MODIFY PARTITION simpleIdentifierWithoutParentheses
    (
        modifyIndexPartitionOptions
        | parametersClause
        | COALESCE
        | UPDATE BLOCK REFERENCES
        | UNUSABLE
    );

modifyIndexPartitionOptions:
    (deallocateUnusedClause
    | allocateExtentClause
    | physicalAttribute
    | loggingClause
    | keyCompression)*;

renameIndexPartition:
    RENAME (PARTITION | SUBPARTITION) simpleIdentifierWithoutParentheses TO simpleIdentifierWithoutParentheses;

dropIndexPartition:
    DROP PARTITION simpleIdentifierWithoutParentheses;

splitIndexPartition:
    SPLIT PARTITION simpleIdentifierWithoutParentheses splitIndexPartitionAtClause
    splitIndexPartitionIntoClause?
    parallelClause?;

splitIndexPartitionAtClause: AT parenthesizedExpressionList;

splitIndexPartitionIntoClause:
    INTO LPAREN indexPartitionDescription COMMA indexPartitionDescription RPAREN;

indexPartitionDescription:
    PARTITION (simpleIdentifierWithoutParentheses (segmentAttributesClause | keyCompression)*)?;

modifyIndexSubpartition:
    MODIFY SUBPARTITION simpleIdentifierWithoutParentheses 
    (
        UNUSABLE
        | allocateExtentClause
        | deallocateUnusedClause
    );

compileTypeClause:
    COMPILE DEBUG? (SPECIFICATION | BODY)? compilerParametersClause? (REUSE SETTINGS)?;

compilerParametersClause:
    simpleIdentifierWithoutParentheses EQUAL_SIGN fullExpression;

replaceTypeClause: REPLACE objectTypeStatement;

alterMethodSpecifications:
    alterMethodSpecification (COMMA alterMethodSpecification)*;

alterMethodSpecification:
    (ADD | DROP)
    (
        objectTypeMapOrderFunction
        | objectTypeMemberStaticRoutine
    );

alterAttributeDefinition:
    addOrModifyAttributeDefinition
    | dropAttributeDefinition;

addOrModifyAttributeDefinition:
    (ADD | MODIFY) ATTRIBUTE (alterTypeDeclaration | alterTypeDeclarationInParen);

alterTypeDeclaration: simpleIdentifier typeReference?;

alterTypeDeclarationInParen:
    LPAREN objectTypeAttributeDeclaration (COMMA objectTypeAttributeDeclaration)* RPAREN;

dropAttributeDefinition:
    DROP ATTRIBUTE simpleIdentifierWithoutParentheses columnListInParenElementClause;

alterCollectionClauses:
    MODIFY (LIMIT literal | ELEMENT TYPE typeReference);

dependentHandlingClause:
    invalidateHandlingClause
    | cascadeHandlingClause;

invalidateHandlingClause: INVALIDATE;

cascadeHandlingClause:
    CASCADE dependentTypesClause? forceExceptionsClause?;

dependentTypesClause:
    includingTableData
    | convertToSubstitutable;

includingTableData: NOT? INCLUDING TABLE DATA;

convertToSubstitutable: CONVERT TO SUBSTITUTABLE;

forceExceptionsClause: FORCE? exceptionsIntoConstraintClause;

alterSequenceStatement:
    SEQUENCE plainIdentifier sequenceOption+;

sequenceOption:
    sequenceIncrementClause
    | sequenceStartWithClause
    | sequenceMaxValueClause
    | sequenceMinValueClause
    | sequenceCycleClause
    | sequenceCacheClause
    | sequenceOrderClause
    | sequenceScaleClause
    | sequenceKeepClause
    | sequenceShardClause
    | sequenceScopeClause;

identityOption:
    sequenceIncrementClause
    | sequenceStartWithClause
    | sequenceMaxValueClause
    | sequenceMinValueClause
    | sequenceCycleClause
    | sequenceCacheClause
    | sequenceOrderClause
    | sequenceScaleClause
    | sequenceKeepClause;

sequenceIncrementClause: INCREMENT BY MINUS_SIGN? INTEGER_LITERAL;

sequenceStartWithClause:
    START WITH (MINUS_SIGN? INTEGER_LITERAL | LIMIT VALUE);

sequenceMaxValueClause:
    MAXVALUE MINUS_SIGN? INTEGER_LITERAL
    | NOMAXVALUE;

sequenceMinValueClause:
    MINVALUE MINUS_SIGN? INTEGER_LITERAL
    | NOMINVALUE;

sequenceCycleClause: CYCLE | NOCYCLE;

sequenceCacheClause:
    CACHE MINUS_SIGN? INTEGER_LITERAL
    | NOCACHE;

sequenceOrderClause: ORDER | NOORDER;

sequenceScaleClause:
    SCALE (EXTEND | NOEXTEND)?
    | NOSCALE;

sequenceKeepClause:
    KEEP | NOKEEP;

sequenceShardClause:
    SHARD (EXTEND | NOEXTEND)?
    | NOSHARD;

sequenceScopeClause:
    SESSION | GLOBAL;

createTypeStatement:
    TYPE plainIdentifier oidClause? completeTypeStatement? alterTypeEmbeddedStatement*;

alterTypeEmbeddedStatement: ALTER alterTypeStatement;

completeTypeStatement:
    objectTypeStatement
    | varrayTypeStatement
    | nestedTableTypeStatement;

objectTypeStatement:
    invokerRightsClause? (topLevelObjectType | subType) objectTypeDeclarationItems? inheritanceClause*;

topLevelObjectType: routineBodyAsIsClause OBJECT;

subType: underClause;

objectTypeDeclarationItems:
    LPAREN objectTypeDeclarationItem (COMMA objectTypeDeclarationItem)* RPAREN;

objectTypeDeclarationItem:
    objectTypeRoutine
    | objectTypeAttributeDeclaration;

objectTypeAttributeDeclaration: simpleIdentifier typeReference;

varrayTypeStatement:
    routineBodyAsIsClause varrayTypeDeclaration;

nestedTableTypeStatement:
    routineBodyAsIsClause tableTypeDeclaration;

oidClause: OID characterStringLiteral;

createTypeBodyStatement:
    TYPE BODY plainIdentifier routineBodyAsIsClause objectTypeBodyDeclarationItems END;

objectTypeBodyDeclarationItems:
    objectTypeRoutine SEMI (objectTypeRoutine SEMI)*;

objectTypeRoutine:
    inheritanceClause?
    (
        objectTypeMemberStaticRoutine
        | objectTypeConstructor
        | objectTypeMapOrderFunction
    );

objectTypeMemberStaticRoutine:
    (MEMBER | STATIC) (procedureStatement | functionStatement);

objectTypeConstructor:
    constructorHeader constructorReturnClause (routineBody | procedureCallSpecClause)?;

constructorHeader:
    CONSTRUCTOR FUNCTION plainIdentifier argumentList?;

constructorReturnClause: RETURN SELF AS RESULT;

objectTypeMapOrderFunction: (MAP | ORDER) MEMBER functionStatement;

inheritanceClause: NOT? (OVERRIDING | FINAL | INSTANTIABLE);

createSynonymStatement:
    PUBLIC? SYNONYM plainIdentifier createSynonymSharingClause? FOR plainRemoteIdentifier;

createSynonymSharingClause:
    SHARING EQUAL_SIGN (METADATA | NONE);
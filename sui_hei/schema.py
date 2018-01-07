import graphene
from django.db.models import Count, Q
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth import login, logout, authenticate
from graphene import relay, resolve_only_args
from graphene_django.filter import DjangoFilterConnectionField
from graphene_django.types import DjangoObjectType

from .models import *


# {{{1 Nodes
# {{{2 UserNode
class UserNode(DjangoObjectType):
    class Meta:
        model = User
        filter_fields = ["username", "nickname"]
        interfaces = (relay.Node, )

    rowid = graphene.Int()

    def resolve_rowid(self, info):
        return self.id


# {{{2 AwardNode
class AwardNode(DjangoObjectType):
    class Meta:
        model = Award
        filter_fields = []
        interfaces = (relay.Node, )

    rowid = graphene.Int()

    def resolve_rowid(self, info):
        return self.id


# {{{2 UserAwardNode
class UserAwardNode(DjangoObjectType):
    class Meta:
        model = UserAward
        filter_fields = []
        interfaces = (relay.Node, )

    rowid = graphene.Int()

    def resolve_rowid(self, info):
        return self.id


# {{{2 PuzzleNode
class PuzzleNode(DjangoObjectType):
    class Meta:
        model = Puzzle
        filter_fields = {
            "status": ["exact", "gt"],
        }
        interfaces = (relay.Node, )

    rowid = graphene.Int()
    quesCount = graphene.Int()
    uaquesCount = graphene.Int()

    def resolve_rowid(self, info):
        return self.id

    def resolve_quesCount(self, info):
        return Dialogue.objects.filter(puzzle=self).count()

    def resolve_uaquesCount(self, info):
        return Dialogue.objects.filter(
            Q(puzzle=self) & (Q(answer__isnull=True)
                              | Q(answer__exact=""))).count()


# {{{2 DialogueNode
class DialogueNode(DjangoObjectType):
    class Meta:
        model = Dialogue
        filter_fields = []
        interfaces = (relay.Node, )

    rowid = graphene.Int()

    def resolve_rowid(self, info):
        return self.id


# {{{2 MinichatNode
class MinichatNode(DjangoObjectType):
    class Meta:
        model = Minichat
        filter_fields = []
        interfaces = (relay.Node, )

    rowid = graphene.Int()

    def resolve_rowid(self, info):
        return self.id


# {{{2 CommentNode
class CommentNode(DjangoObjectType):
    class Meta:
        model = Comment
        filter_fields = []
        interfaces = (relay.Node, )

    rowid = graphene.Int()

    def resolve_rowid(self, info):
        return self.id


# {{{2 StarNode
class StarNode(DjangoObjectType):
    class Meta:
        model = Star
        filter_fields = []
        interfaces = (relay.Node, )

    rowid = graphene.Int()

    def resolve_rowid(self, info):
        return self.id


# {{{1 Mutations
# {{{2 CreatePuzzle
class CreatePuzzle(relay.ClientIDMutation):
    class Input:
        puzzleTitle = graphene.String(required=True)
        puzzleGenre = graphene.Int(required=True)
        puzzleYami = graphene.Boolean(required=True)
        puzzleContent = graphene.String(required=True)
        puzzleKaisetu = graphene.String(required=True)

    puzzle = graphene.Field(PuzzleNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        user = info.context.user
        if (not user.is_authenticated):
            raise ValidationError(_("Please login!"))

        title = input["puzzleTitle"]
        genre = input["puzzleGenre"]
        yami = input["puzzleYami"]
        content = input["puzzleContent"]
        solution = input["puzzleKaisetu"]

        created = timezone.now()

        puzzle = Puzzle.objects.create(
            user=user,
            title=title,
            genre=genre,
            yami=yami,
            content=content,
            solution=solution,
            created=created,
            modified=created)
        puzzle.save()

        return CreatePuzzle(puzzle=puzzle)

# {{{2 Login
class UserLogin(relay.ClientIDMutation):
    class Input:
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    user = graphene.Field(UserNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        request = info.context
        username = input["username"]
        password = input["password"]

        user = authenticate(request, username=username, password=password)
        if user is None:
            raise ValidationError(_("Login incorrect!"))

        login(request, user)
        return UserLogin(user=user)

# {{{2 Logout
class UserLogout(relay.ClientIDMutation):
    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        request = info.context
        logout(request)
        return UserLogout()

# {{{1 Query
class Query(object):
    # {{{2 definitions
    all_users = DjangoFilterConnectionField(
        UserNode, orderBy=graphene.List(of_type=graphene.String))
    all_awards = DjangoFilterConnectionField(
        AwardNode, orderBy=graphene.List(of_type=graphene.String))
    all_userawards = DjangoFilterConnectionField(
        UserAwardNode, orderBy=graphene.List(of_type=graphene.String))
    all_puzzles = DjangoFilterConnectionField(
        PuzzleNode, orderBy=graphene.List(of_type=graphene.String))
    all_dialogues = DjangoFilterConnectionField(
        DialogueNode, orderBy=graphene.List(of_type=graphene.String))
    all_minichats = DjangoFilterConnectionField(
        MinichatNode, orderBy=graphene.List(of_type=graphene.String))
    all_comments = DjangoFilterConnectionField(
        CommentNode, orderBy=graphene.List(of_type=graphene.String))
    all_stars = DjangoFilterConnectionField(
        StarNode, orderBy=graphene.List(of_type=graphene.String))

    user = relay.Node.Field(UserNode)
    award = relay.Node.Field(AwardNode)
    useraward = relay.Node.Field(UserAwardNode)
    puzzle = relay.Node.Field(PuzzleNode)
    dialogue = relay.Node.Field(DialogueNode)
    minichat = relay.Node.Field(MinichatNode)
    comment = relay.Node.Field(CommentNode)
    star = relay.Node.Field(StarNode)

    # {{{2 resolves
    # {{{3 resolve all
    def resolve_all_users(self, info, **kwargs):
        orderBy = kwargs.get("orderBy", None)

        if orderBy:
            return User.objects.order_by(*orderBy)
        else:
            return User.objects.all()

    def resolve_all_awards(self, info, **kwargs):
        orderBy = kwargs.get("orderBy", None)

        if orderBy:
            return Award.objects.order_by(*orderBy)
        else:
            return Award.objects.all()

    def resolve_all_userawards(self, info, **kwargs):
        orderBy = kwargs.get("orderBy", None)

        if orderBy:
            return UserAward.objects.order_by(*orderBy)
        else:
            return UserAward.objects.all()

    def resolve_all_puzzles(self, info, **kwargs):
        orderBy = kwargs.get("orderBy", None)

        if orderBy:
            return Puzzle.objects.order_by(*orderBy)
        else:
            return Puzzle.objects.all()

    def resolve_all_dialogues(self, info, **kwargs):
        orderBy = kwargs.get("orderBy", None)

        if orderBy:
            return Minichat.objects.order_by(*orderBy)
        else:
            return Minichat.objects.all()

    def resolve_all_minichats(self, info, **kwargs):
        orderBy = kwargs.get("orderBy", None)

        if orderBy:
            return Minichat.objects.order_by(*orderBy)
        else:
            return Minichat.objects.all()

    def resolve_all_comments(self, info, **kwargs):
        orderBy = kwargs.get("orderBy", None)

        if orderBy:
            return Comment.objects.order_by(*orderBy)
        else:
            return Comment.objects.all()

    def resolve_all_stars(self, info, **kwargs):
        orderBy = kwargs.get("orderBy", None)

        if orderBy:
            return Star.objects.order_by(*orderBy)
        else:
            return Star.objects.all()

    # {{{3 resolve single
    def resolve_user(self, info, **kwargs):
        user_id = kwargs.get("rowid")
        if user_id is not None:
            return User.objects.get(pk=user_id)
        return None

    def resolve_award(self, info, **kwargs):
        award_id = kwargs.get("rowid")
        if award_id is not None:
            return Award.objects.get(pk=award_id)
        return None

    def resolve_useraward(self, info, **kwargs):
        useraward_id = kwargs.get("rowid")
        if useraward_id is not None:
            return UserAward.objects.get(pk=useraward_id)
        return None

    def resolve_puzzle(self, info, **kwargs):
        puzzle_id = kwargs.get("rowid")
        if puzzle_id is not None:
            return Puzzle.objects.get(pk=puzzle_id)
        return None

    def resolve_dialogue(self, info, **kwargs):
        dialogue_id = kwargs.get("rowid")
        if dialogue_id is not None:
            return Minichat.objects.get(pk=dialogue_id)
        return None

    def resolve_minichat(self, info, **kwargs):
        minichat_id = kwargs.get("rowid")
        if minichat_id is not None:
            return Minichat.objects.get(pk=minichat_id)
        return None

    def resolve_comment(self, info, **kwargs):
        comment_id = kwargs.get("rowid")
        if comment_id is not None:
            return Comment.objects.get(pk=comment_id)
        return None

    def resolve_star(self, info, **kwargs):
        star_id = kwargs.get("rowid")
        if star_id is not None:
            return Star.objects.get(pk=star_id)
        return None
# {{{1 Mutation
class Mutation(graphene.ObjectType):
    create_puzzle = CreatePuzzle.Field()
    login = UserLogin.Field()
    logout = UserLogout.Field()
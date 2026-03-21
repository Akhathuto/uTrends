// @google/genai Coding Guidelines:
// This file contains all the SVG icon components used in the application.

import React from 'react';
import { 
  Send, Star, Sparkles, Trash2, Volume2, VolumeX, Gift, Mic, Bot, Paperclip, X, ChevronDown,
  TrendingUp, Search, BarChart2, MessageSquare, History, Lightbulb, Video, DollarSign, FileText, Rocket, Briefcase, User, HelpCircle, Mail, Info, Shield, Wand, Clapperboard, PenTool, Image, Scissors, Type, RefreshCw,
  Youtube, Music, TrendingDown, ExternalLink, LogOut, CheckCircle, ArrowLeft, Zap, Sliders, ChevronsRight, StopCircle, Play, Menu, Save, ClipboardCopy, Copy, Trash, Settings, MicOff, BookOpen,
  AlertCircle, Check, XCircle, Loader2, MoreVertical, Plus, Minus, Filter, Download, Share2, Heart, MessageCircle, Eye, Clock, Calendar, MapPin, Globe, Link, Github, Twitter, Linkedin, Facebook, Instagram,
  Home, Layout, Repeat, Users, Library, Target, MessageSquarePlus
} from 'lucide-react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  />
);

// Custom Icons
export const UTrendsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} strokeWidth="2.5"><path d="M4 20V4h4v12h8V4h4v16" /><path d="m4 12 8-8 8 8" /></Icon>
);

export const NoloIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></Icon>
);

// Aliases for compatibility
export {
  Send, Star, Sparkles, Trash2, Volume2, VolumeX, Gift as Gif, Mic, Bot, Paperclip, X, ChevronDown,
  TrendingUp, Search, BarChart2, MessageSquare, History, Lightbulb, Video, DollarSign, FileText, Rocket, Briefcase, User, HelpCircle, Mail, Info, Shield, Wand, Clapperboard, PenTool, Image, Scissors, Type, RefreshCw,
  Youtube, Music as TikTok, TrendingDown, ExternalLink, LogOut, CheckCircle, ArrowLeft, Zap, Sliders, ChevronsRight, StopCircle, Play, Menu, Save, ClipboardCopy, Copy, Trash, Settings, MicOff, BookOpen,
  AlertCircle, Check, XCircle, Loader2 as Loader, MoreVertical, Plus, Minus, Filter, Download, Share2, Heart, MessageCircle, Eye, Clock, Calendar, MapPin, Globe, Link, Github, Twitter, Linkedin, Facebook, Instagram,
  Home, Layout as Thumbnail, Repeat, Users as UserHexagon, Library as MyContent, Target, MessageSquarePlus
};

// Icon-suffixed aliases
export const SendIcon = Send;
export const StarIcon = Star;
export const SparklesIcon = Sparkles;
export const Trash2Icon = Trash2;
export const Volume2Icon = Volume2;
export const VolumeXIcon = VolumeX;
export const GifIcon = Gift;
export const MicIcon = Mic;
export const BotIcon = Bot;
export const PaperclipIcon = Paperclip;
export const XIcon = X;
export const ChevronDownIcon = ChevronDown;
export const TrendingUpIcon = TrendingUp;
export const SearchIcon = Search;
export const BarChart2Icon = BarChart2;
export const MessageSquareIcon = MessageSquare;
export const HistoryIcon = History;
export const LightbulbIcon = Lightbulb;
export const VideoIcon = Video;
export const DollarSignIcon = DollarSign;
export const FileTextIcon = FileText;
export const RocketIcon = Rocket;
export const BriefcaseIcon = Briefcase;
export const UserIcon = User;
export const HelpCircleIcon = HelpCircle;
export const MailIcon = Mail;
export const InfoIcon = Info;
export const ShieldIcon = Shield;
export const WandIcon = Wand;
export const ClapperboardIcon = Clapperboard;
export const PenToolIcon = PenTool;
export const ImageIcon = Image;
export const ScissorsIcon = Scissors;
export const TypeIcon = Type;
export const RefreshCwIcon = RefreshCw;
export const YouTubeIcon = Youtube;
export const TikTokIcon = Music;
export const TrendingDownIcon = TrendingDown;
export const ExternalLinkIcon = ExternalLink;
export const LogOutIcon = LogOut;
export const CheckCircleIcon = CheckCircle;
export const ArrowLeftIcon = ArrowLeft;
export const ZapIcon = Zap;
export const SlidersIcon = Sliders;
export const ChevronsRightIcon = ChevronsRight;
export const StopCircleIcon = StopCircle;
export const PlayIcon = Play;
export const MenuIcon = Menu;
export const SaveIcon = Save;
export const ClipboardCopyIcon = ClipboardCopy;
export const CopyIcon = Copy;
export const TrashIcon = Trash;
export const SettingsIcon = Settings;
export const MicOffIcon = MicOff;
export const BookOpenIcon = BookOpen;
export const AlertCircleIcon = AlertCircle;
export const CheckIcon = Check;
export const XCircleIcon = XCircle;
export const LoaderIcon = Loader2;
export const MoreVerticalIcon = MoreVertical;
export const PlusIcon = Plus;
export const MinusIcon = Minus;
export const FilterIcon = Filter;
export const DownloadIcon = Download;
export const Share2Icon = Share2;
export const HeartIcon = Heart;
export const MessageCircleIcon = MessageCircle;
export const EyeIcon = Eye;
export const ClockIcon = Clock;
export const CalendarIcon = Calendar;
export const MapPinIcon = MapPin;
export const GlobeIcon = Globe;
export const LinkIcon = Link;
export const GithubIcon = Github;
export const TwitterIcon = Twitter;
export const LinkedinIcon = Linkedin;
export const FacebookIcon = Facebook;
export const InstagramIcon = Instagram;
export const HomeIcon = Home;
export const ThumbnailIcon = Layout;
export const RepeatIcon = Repeat;
export const UserHexagonIcon = Users;
export const MyContentIcon = Library;
export const TargetIcon = Target;
export const MessageSquarePlusIcon = MessageSquarePlus;
export const VideoEditIcon = Scissors;
